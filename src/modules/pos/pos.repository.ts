import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { randomUUID } from "crypto";
import type { PosVentaDto } from "./pos.schema";
import type { ProductoPOS, UltimaVenta } from "./pos.types";

/**
 * Repositorio POS — queries Prisma para el Punto de Venta.
 * Solo acceso a datos, sin logica de negocio.
 */
export const POSRepository = {
  /**
   * Busca productos activos con stock disponible para el catalogo del POS.
   * Incluye productos sin control de stock (servicios, etc.).
   */
  async getProductosPOS(tenantId: string, search?: string): Promise<ProductoPOS[]> {
    const where = {
      tenantId,
      isActive: true,
      // Stock disponible: trackStock=false (servicios) o stock > 0
      OR: [
        { trackStock: false },
        { trackStock: true, stock: { gt: 0 } },
      ],
      // Filtro de busqueda por nombre, SKU o codigo de barras
      ...(search && search.trim().length > 0
        ? {
            AND: [
              {
                OR: [
                  { name: { contains: search.trim(), mode: "insensitive" as const } },
                  { sku: { contains: search.trim(), mode: "insensitive" as const } },
                  { barcode: { contains: search.trim(), mode: "insensitive" as const } },
                ],
              },
            ],
          }
        : {}),
    };

    const productos = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        price: true,
        cost: true,
        taxRate: true,
        stock: true,
        unit: true,
        image: true,
        trackStock: true,
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    // Convertir Decimal a number para serializacion
    return productos.map((p) => ({
      ...p,
      price: Number(p.price),
      cost: Number(p.cost),
      taxRate: Number(p.taxRate),
      stock: Number(p.stock),
    }));
  },

  /**
   * Procesa una venta completa en una transaccion atomica.
   * Crea factura, items, descuenta stock, registra movimientos y CxC si aplica.
   */
  async procesarVenta(tenantId: string, userId: string, data: PosVentaDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Verificar stock suficiente para cada producto con control de inventario
      for (const item of data.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId, isActive: true },
        });

        if (!product) {
          throw new AppError(
            ErrorCodes.NOT_FOUND,
            `Producto "${item.name}" no encontrado`,
            404
          );
        }

        if (product.trackStock && Number(product.stock) < item.quantity) {
          throw new AppError(
            ErrorCodes.INSUFFICIENT_STOCK,
            `Stock insuficiente para "${product.name}". Disponible: ${Number(product.stock)} ${product.unit}`,
            422,
            { available: Number(product.stock), requested: item.quantity }
          );
        }
      }

      // 2. Calcular totales de la factura
      let subtotalFactura = 0; // Sin IVA
      let ivaDebitoTotal = 0;

      for (const item of data.items) {
        // El precio ya incluye IVA; extraer precio sin IVA
        const precioSinIva = item.unitPrice / (1 + item.taxRate);
        const descuentoMonto = precioSinIva * item.quantity * (item.discount / 100);
        const subtotalItem = precioSinIva * item.quantity - descuentoMonto;
        const ivaItem = subtotalItem * item.taxRate;

        subtotalFactura += subtotalItem;
        ivaDebitoTotal += ivaItem;
      }

      const totalFactura = subtotalFactura + ivaDebitoTotal;

      // 3. Obtener proximo correlativo por tipo de documento
      const maxCorrelativo = await tx.invoice.findFirst({
        where: { tenantId, tipoDoc: data.tipoDoc },
        orderBy: { correlativo: "desc" },
        select: { correlativo: true },
      });

      const siguienteCorrelativo = maxCorrelativo
        ? String(parseInt(maxCorrelativo.correlativo, 10) + 1).padStart(8, "0")
        : "00000001";

      // 4. Crear la factura principal
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          customerId: data.customerId ?? null,
          tipoDoc: data.tipoDoc,
          correlativo: siguienteCorrelativo,
          codigoGeneracion: randomUUID().toUpperCase(),
          subtotal: parseFloat(subtotalFactura.toFixed(2)),
          descuento: 0,
          ivaDebito: parseFloat(ivaDebitoTotal.toFixed(2)),
          total: parseFloat(totalFactura.toFixed(2)),
          status: "DRAFT",
          paymentMethod: data.paymentMethod,
          notes: data.notes ?? null,
          createdBy: userId,
        },
      });

      // 5. Crear los items de la factura
      for (const item of data.items) {
        const precioSinIva = item.unitPrice / (1 + item.taxRate);
        const descuentoMonto = precioSinIva * item.quantity * (item.discount / 100);
        const subtotalItem = precioSinIva * item.quantity - descuentoMonto;
        const ivaItem = subtotalItem * item.taxRate;
        const totalItem = subtotalItem + ivaItem;

        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            description: item.name,
            quantity: item.quantity,
            unitPrice: parseFloat(precioSinIva.toFixed(2)),
            discount: parseFloat(descuentoMonto.toFixed(2)),
            taxRate: item.taxRate,
            subtotal: parseFloat(subtotalItem.toFixed(2)),
            ivaAmount: parseFloat(ivaItem.toFixed(2)),
            total: parseFloat(totalItem.toFixed(2)),
          },
        });
      }

      // 6. Descontar stock y crear movimientos de inventario
      for (const item of data.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId },
          select: { id: true, stock: true, trackStock: true },
        });

        if (!product) continue;

        if (product.trackStock) {
          const stockAnterior = Number(product.stock);
          const nuevoStock = stockAnterior - item.quantity;

          // Actualizar stock del producto
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: nuevoStock },
          });

          // Registrar movimiento de inventario (Kardex)
          await tx.inventoryMovement.create({
            data: {
              tenantId,
              productId: item.productId,
              type: "EXIT",
              quantity: item.quantity,
              unitCost: 0, // Se puede calcular costo promedio en siguiente fase
              previousStock: stockAnterior,
              newStock: nuevoStock,
              referenceType: "INVOICE",
              referenceId: invoice.id,
              reason: `Venta POS — ${data.tipoDoc} #${siguienteCorrelativo}`,
              createdBy: userId,
            },
          });
        }
      }

      // 7. Si el metodo de pago es CREDITO, crear CxC con vencimiento a 30 dias
      if (data.paymentMethod === "CREDIT" && data.customerId) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

        await tx.accountReceivable.create({
          data: {
            tenantId,
            customerId: data.customerId,
            invoiceId: invoice.id,
            amount: parseFloat(totalFactura.toFixed(2)),
            paid: 0,
            balance: parseFloat(totalFactura.toFixed(2)),
            dueDate: fechaVencimiento,
            status: "PENDING",
            createdBy: userId,
          },
        });
      }

      return invoice;
    });
  },

  /**
   * Obtiene las ultimas ventas del dia para el panel del POS.
   */
  async getLastVentas(tenantId: string, limit = 10): Promise<UltimaVenta[]> {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const ventas = await prisma.invoice.findMany({
      where: {
        tenantId,
        createdAt: { gte: inicioDia },
        isActive: true,
      },
      select: {
        id: true,
        correlativo: true,
        tipoDoc: true,
        total: true,
        createdAt: true,
        customer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return ventas.map((v) => ({
      ...v,
      total: Number(v.total),
      createdAt: v.createdAt.toISOString(),
    }));
  },
};

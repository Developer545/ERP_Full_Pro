import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { type Prisma, PurchaseStatus } from "@prisma/client";
import type { CreateCompraSchemaDto, CompraFiltrosSchemaDto } from "./compras.schema";

/** Include para listado de ordenes de compra */
const COMPRA_LIST_INCLUDE = {
  supplier: {
    select: {
      id: true,
      name: true,
      nit: true,
      email: true,
    },
  },
  _count: {
    select: { items: true },
  },
} as const;

/** Include completo para detalle de OC */
const COMPRA_DETAIL_INCLUDE = {
  supplier: {
    select: {
      id: true,
      name: true,
      nit: true,
      nrc: true,
      email: true,
      phone: true,
      address: true,
      contactName: true,
    },
  },
  items: true,
  accountsPayable: {
    select: {
      id: true,
      amount: true,
      paid: true,
      balance: true,
      status: true,
      dueDate: true,
    },
  },
} as const;

/**
 * Formatea un numero a correlativo de OC de 8 digitos: 1 → "OC-00000001"
 */
function formatNumeroOC(n: number): string {
  return `OC-${String(n).padStart(8, "0")}`;
}

/**
 * Repositorio de Ordenes de Compra — solo queries Prisma, sin logica de negocio.
 */
export const ComprasRepository = {
  /**
   * Lista paginada de OC con filtros.
   */
  async findAll(filtros: CompraFiltrosSchemaDto) {
    const tenantId = getCurrentTenantId();
    const { search, status, supplierId, from, to, page, pageSize } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PurchaseOrderWhereInput = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { numero: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
          { supplier: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(status && { status: status as PurchaseStatus }),
      ...(supplierId && { supplierId }),
      ...(from || to
        ? {
            fechaOrden: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: COMPRA_LIST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * OC completa por ID (con items, proveedor y CxP).
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.purchaseOrder.findFirst({
      where: { id, tenantId, isActive: true },
      include: COMPRA_DETAIL_INCLUDE,
    });
  },

  /**
   * Crea una OC con sus items en una transaccion atomica.
   * Genera numero correlativo "OC-00000001" con MAX()+1.
   */
  async create(
    data: CreateCompraSchemaDto & {
      subtotal: number;
      descuento: number;
      iva: number;
      total: number;
      userId: string;
    }
  ) {
    const tenantId = getCurrentTenantId();
    const { items, subtotal, descuento, iva, total, userId, ...rest } = data;

    return prisma.$transaction(async (tx) => {
      // Generar numero correlativo: obtener MAX + 1
      const lastOC = await tx.purchaseOrder.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        select: { numero: true },
      });

      let nextNum = 1;
      if (lastOC?.numero) {
        // Extraer el numero del formato "OC-00000001"
        const match = lastOC.numero.match(/OC-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }

      const numero = formatNumeroOC(nextNum);

      // Crear la OC principal
      const oc = await tx.purchaseOrder.create({
        data: {
          tenantId,
          numero,
          supplierId: rest.supplierId,
          reference: rest.reference ?? null,
          fechaEsperada: rest.fechaEsperada ? new Date(rest.fechaEsperada) : null,
          subtotal,
          descuento,
          iva,
          total,
          notes: rest.notes ?? null,
          status: "DRAFT",
          createdBy: userId,
          isActive: true,
        },
        include: COMPRA_DETAIL_INCLUDE,
      });

      // Crear los items de la OC
      await tx.purchaseOrderItem.createMany({
        data: items.map((item) => {
          const lineSubtotal = item.unitCost * item.quantity - (item.discount ?? 0);
          const lineIva = Math.max(0, lineSubtotal) * (item.taxRate ?? 0.13);
          const lineTotal = lineSubtotal + lineIva;

          return {
            purchaseOrderId: oc.id,
            productId: item.productId ?? null,
            description: item.description,
            quantity: item.quantity,
            unitCost: item.unitCost,
            discount: item.discount ?? 0,
            taxRate: item.taxRate ?? 0.13,
            subtotal: Math.max(0, lineSubtotal),
            ivaAmount: Math.max(0, lineIva),
            total: Math.max(0, lineTotal),
            quantityReceived: 0,
          };
        }),
      });

      // Retornar OC con items
      return tx.purchaseOrder.findUnique({
        where: { id: oc.id },
        include: COMPRA_DETAIL_INCLUDE,
      });
    });
  },

  /**
   * Actualiza solo el status de una OC.
   */
  async updateStatus(id: string, status: PurchaseStatus, userId?: string) {
    const tenantId = getCurrentTenantId();
    return prisma.purchaseOrder.update({
      where: { id, tenantId },
      data: {
        status,
        ...(userId ? { updatedBy: userId } : {}),
      },
    });
  },

  /**
   * Recibe mercaderia de una OC.
   * Para cada item: actualiza quantityReceived, incrementa stock del producto
   * y crea un InventoryMovement de tipo ENTRY.
   * Actualiza el status a PARTIAL o RECEIVED segun si todos los items estan completos.
   */
  async recibirOrden(
    id: string,
    items: { itemId: string; quantityReceived: number }[],
    userId: string
  ) {
    const tenantId = getCurrentTenantId();

    return prisma.$transaction(async (tx) => {
      // Obtener la OC con sus items
      const oc = await tx.purchaseOrder.findFirst({
        where: { id, tenantId, isActive: true },
        include: { items: true },
      });

      if (!oc) {
        throw new Error("Orden de compra no encontrada");
      }

      // Procesar cada item recibido
      for (const recibido of items) {
        const ocItem = oc.items.find((i) => i.id === recibido.itemId);
        if (!ocItem) continue;

        const nuevaCantidadRecibida =
          Number(ocItem.quantityReceived) + recibido.quantityReceived;

        // Actualizar quantityReceived en el item
        await tx.purchaseOrderItem.update({
          where: { id: ocItem.id },
          data: { quantityReceived: nuevaCantidadRecibida },
        });

        // Actualizar stock del producto si aplica
        if (ocItem.productId) {
          const product = await tx.product.findFirst({
            where: { id: ocItem.productId, tenantId },
            select: { id: true, stock: true, trackStock: true },
          });

          if (product && product.trackStock) {
            const stockAnterior = Number(product.stock);
            const nuevoStock = stockAnterior + recibido.quantityReceived;

            await tx.product.update({
              where: { id: product.id, tenantId },
              data: { stock: nuevoStock },
            });

            // Registrar movimiento de inventario
            await tx.inventoryMovement.create({
              data: {
                tenantId,
                productId: product.id,
                type: "ENTRY",
                quantity: recibido.quantityReceived,
                unitCost: Number(ocItem.unitCost),
                previousStock: stockAnterior,
                newStock: nuevoStock,
                referenceType: "PURCHASE",
                referenceId: id,
                reason: `Recepcion OC ${oc.numero} — ${ocItem.description}`,
                createdBy: userId,
              },
            });
          }
        }
      }

      // Recargar items actualizados para verificar estado
      const ocActualizada = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!ocActualizada) throw new Error("Error al actualizar la OC");

      // Determinar nuevo status: RECEIVED si todos completos, PARTIAL si no
      const todosCompletos = ocActualizada.items.every(
        (item) => Number(item.quantityReceived) >= Number(item.quantity)
      );

      const nuevoStatus: PurchaseStatus = todosCompletos ? "RECEIVED" : "PARTIAL";

      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: nuevoStatus,
          ...(todosCompletos ? { fechaRecibida: new Date() } : {}),
          updatedBy: userId,
        },
      });

      return tx.purchaseOrder.findUnique({
        where: { id },
        include: COMPRA_DETAIL_INCLUDE,
      });
    });
  },

  /**
   * Soft delete de una OC (isActive = false).
   */
  async softDelete(id: string, userId?: string) {
    const tenantId = getCurrentTenantId();
    return prisma.purchaseOrder.update({
      where: { id, tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        ...(userId ? { updatedBy: userId } : {}),
      },
    });
  },

  /**
   * Retorna KPIs del mes actual para el dashboard del modulo.
   */
  async getKPIs() {
    const tenantId = getCurrentTenantId();
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

    const [total, pendientes, recibidasMes, montosPendientes] = await Promise.all([
      prisma.purchaseOrder.count({
        where: { tenantId, isActive: true },
      }),
      prisma.purchaseOrder.count({
        where: {
          tenantId,
          isActive: true,
          status: { in: ["DRAFT", "SENT", "PARTIAL"] },
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          tenantId,
          isActive: true,
          status: "RECEIVED",
          fechaRecibida: { gte: inicioMes, lte: finMes },
        },
      }),
      prisma.purchaseOrder.aggregate({
        where: {
          tenantId,
          isActive: true,
          status: { in: ["DRAFT", "SENT", "PARTIAL"] },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      total,
      pendientes,
      recibidasMes,
      montoPendiente: Number(montosPendientes._sum.total ?? 0),
    };
  },
};

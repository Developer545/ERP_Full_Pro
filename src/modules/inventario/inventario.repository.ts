import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { CreateMovementInput, InventarioFiltros } from "./inventario.types";

/**
 * Repositorio de Inventario — solo queries Prisma, sin logica de negocio.
 */
export const InventarioRepository = {
  /**
   * Lista paginada de movimientos con filtros opcionales.
   */
  async getMovimientos(filtros: InventarioFiltros) {
    const tenantId = getCurrentTenantId();
    const { productId, type, from, to, page = 1, pageSize = 20 } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InventoryMovementWhereInput = {
      tenantId,
      ...(productId && { productId }),
      ...(type && { type: type as Prisma.EnumMovementTypeFilter }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, unit: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Resumen de stock por producto con alerta de stock bajo.
   */
  async getResumenStock() {
    const tenantId = getCurrentTenantId();

    const productos = await prisma.product.findMany({
      where: { tenantId, isActive: true, trackStock: true },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
      },
      orderBy: { name: "asc" },
    });

    return productos.map((p) => ({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      stock: Number(p.stock),
      minStock: Number(p.minStock),
      isLow: Number(p.stock) < Number(p.minStock),
    }));
  },

  /**
   * Kardex completo de un producto con saldo corrido.
   */
  async getKardexProducto(productId: string) {
    const tenantId = getCurrentTenantId();

    const movimientos = await prisma.inventoryMovement.findMany({
      where: { tenantId, productId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, unit: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Calcular saldo corrido (newStock ya lo tiene almacenado en cada movimiento)
    return movimientos.map((m, index) => ({
      ...m,
      index: index + 1,
      saldo: Number(m.newStock),
    }));
  },

  /**
   * Crea un movimiento de inventario y actualiza el stock del producto.
   * Usa transaccion para garantizar consistencia atomica.
   */
  async createMovimiento(data: CreateMovementInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.$transaction(async (tx) => {
      // Obtener stock actual del producto
      const producto = await tx.product.findFirst({
        where: { id: data.productId, tenantId },
        select: { id: true, stock: true },
      });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      const previousStock = Number(producto.stock);

      // Calcular nuevo stock segun tipo de movimiento
      let newStock: number;
      const qty = data.quantity;

      if (
        data.type === "ENTRY" ||
        data.type === "INITIAL" ||
        data.type === "RETURN"
      ) {
        // Entradas incrementan el stock
        newStock = previousStock + qty;
      } else if (data.type === "EXIT") {
        // Salidas decrementan el stock
        newStock = previousStock - qty;
      } else {
        // ADJUSTMENT y TRANSFER: quantity = delta (positivo o negativo manejado en service)
        newStock = previousStock + qty;
      }

      // Crear el movimiento
      const movimiento = await tx.inventoryMovement.create({
        data: {
          tenantId,
          productId: data.productId,
          type: data.type,
          quantity: qty,
          unitCost: data.unitCost ?? 0,
          previousStock,
          newStock,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          reason: data.reason,
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, unit: true },
          },
        },
      });

      // Actualizar stock del producto
      await tx.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      });

      return movimiento;
    });
  },
};

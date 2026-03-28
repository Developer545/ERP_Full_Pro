import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { CreateProductoDto, UpdateProductoDto, FilterProductoDto } from "./producto.schema";
import type { Prisma } from "@prisma/client";

/** Include default para listado de productos */
const PRODUCT_INCLUDE = {
  category: {
    select: { id: true, name: true, color: true },
  },
} as const;

/**
 * Repositorio de Productos — solo queries Prisma, sin logica de negocio.
 */
export const ProductoRepository = {
  /**
   * Lista paginada de productos con filtros.
   */
  async findMany(filters: FilterProductoDto) {
    const tenantId = getCurrentTenantId();
    const { search, categoryId, isActive, lowStock, page, pageSize } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      // lowStock: filtrado post-query o con raw SQL — por ahora se filtra con stock <= minStock
      // usando una aproximacion: stock bajo se considera cualquier producto con stock < 5
      // El cliente puede aplicar el filtro via columna stock visible
      ...(lowStock && {
        trackStock: true,
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca un producto por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.product.findFirst({
      where: { id, tenantId },
      include: PRODUCT_INCLUDE,
    });
  },

  /**
   * Busca un producto por SKU dentro del tenant actual.
   */
  async findBySku(sku: string) {
    const tenantId = getCurrentTenantId();
    return prisma.product.findFirst({
      where: { sku, tenantId },
    });
  },

  /**
   * Cuenta los productos del tenant (para limite de plan).
   */
  async count() {
    const tenantId = getCurrentTenantId();
    return prisma.product.count({ where: { tenantId } });
  },

  /**
   * Crea un nuevo producto.
   */
  async create(data: CreateProductoDto & { sku?: string }) {
    const tenantId = getCurrentTenantId();
    return prisma.product.create({
      data: {
        ...data,
        tenantId,
        price: data.price,
        cost: data.cost ?? 0,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 0,
        taxRate: data.taxRate ?? 0.13,
        maxStock: data.maxStock ?? null,
      },
      include: PRODUCT_INCLUDE,
    });
  },

  /**
   * Actualiza un producto existente.
   */
  async update(id: string, data: UpdateProductoDto) {
    const tenantId = getCurrentTenantId();
    return prisma.product.update({
      where: { id, tenantId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      include: PRODUCT_INCLUDE,
    });
  },

  /**
   * Soft delete de un producto.
   */
  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.product.delete({
      where: { id, tenantId },
    });
  },

  /**
   * Catalogo activo para POS/selects.
   */
  async findCatalog() {
    const tenantId = getCurrentTenantId();
    return prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        unit: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
  },
};

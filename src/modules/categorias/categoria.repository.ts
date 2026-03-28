import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { CreateCategoriaDto, UpdateCategoriaDto, FilterCategoriaDto } from "./categoria.schema";

/**
 * Repositorio de Categorias — solo queries Prisma, sin logica de negocio.
 */
export const CategoriaRepository = {
  /**
   * Obtiene una lista paginada de categorias del tenant actual.
   */
  async findMany(filters: FilterCategoriaDto) {
    const tenantId = getCurrentTenantId();
    const { search, isActive, page, pageSize } = filters;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca una categoria por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.category.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { products: true } } },
    });
  },

  /**
   * Busca una categoria por nombre dentro del tenant actual.
   */
  async findByName(name: string) {
    const tenantId = getCurrentTenantId();
    return prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, tenantId },
    });
  },

  /**
   * Crea una nueva categoria.
   */
  async create(data: CreateCategoriaDto) {
    const tenantId = getCurrentTenantId();
    return prisma.category.create({
      data: {
        ...data,
        tenantId,
      },
    });
  },

  /**
   * Actualiza una categoria existente.
   */
  async update(id: string, data: UpdateCategoriaDto) {
    const tenantId = getCurrentTenantId();
    return prisma.category.update({
      where: { id, tenantId },
      data,
    });
  },

  /**
   * Soft delete de una categoria (extension de Prisma convierte esto en update).
   */
  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.category.delete({
      where: { id, tenantId },
    });
  },

  /**
   * Lista simplificada para selects/dropdowns.
   */
  async findAllActive() {
    const tenantId = getCurrentTenantId();
    return prisma.category.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });
  },
};

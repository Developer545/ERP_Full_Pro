import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { CreateProveedorDto, UpdateProveedorDto, FilterProveedorDto } from "./proveedor.schema";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Proveedores — solo queries Prisma, sin logica de negocio.
 */
export const ProveedorRepository = {
  /**
   * Lista paginada de proveedores con filtros.
   */
  async findMany(filters: FilterProveedorDto) {
    const tenantId = getCurrentTenantId();
    const { search, isActive, page, pageSize } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SupplierWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { nit: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.supplier.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca un proveedor por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.supplier.findFirst({
      where: { id, tenantId },
    });
  },

  /**
   * Crea un nuevo proveedor.
   */
  async create(data: CreateProveedorDto) {
    const tenantId = getCurrentTenantId();
    return prisma.supplier.create({
      data: {
        ...data,
        tenantId,
        creditLimit: data.creditLimit ?? 0,
      },
    });
  },

  /**
   * Actualiza un proveedor existente.
   */
  async update(id: string, data: UpdateProveedorDto) {
    const tenantId = getCurrentTenantId();
    return prisma.supplier.update({
      where: { id, tenantId },
      data: {
        ...data,
      },
    });
  },

  /**
   * Soft delete de un proveedor.
   */
  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.supplier.delete({
      where: { id, tenantId },
    });
  },
};

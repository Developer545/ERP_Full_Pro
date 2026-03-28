import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { CreateClienteDto, UpdateClienteDto, FilterClienteDto } from "./cliente.schema";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Clientes — solo queries Prisma, sin logica de negocio.
 */
export const ClienteRepository = {
  /**
   * Lista paginada de clientes con filtros.
   */
  async findMany(filters: FilterClienteDto) {
    const tenantId = getCurrentTenantId();
    const { search, docType, isActive, page, pageSize } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CustomerWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { docNumber: { contains: search, mode: "insensitive" } },
          { nit: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(docType && { docType }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca un cliente por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.customer.findFirst({
      where: { id, tenantId },
    });
  },

  /**
   * Crea un nuevo cliente.
   */
  async create(data: CreateClienteDto) {
    const tenantId = getCurrentTenantId();
    return prisma.customer.create({
      data: {
        ...data,
        tenantId,
        creditLimit: data.creditLimit ?? 0,
      },
    });
  },

  /**
   * Actualiza un cliente existente.
   */
  async update(id: string, data: UpdateClienteDto) {
    const tenantId = getCurrentTenantId();
    return prisma.customer.update({
      where: { id, tenantId },
      data: {
        ...data,
      },
    });
  },

  /**
   * Soft delete de un cliente.
   */
  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.customer.delete({
      where: { id, tenantId },
    });
  },

  /**
   * Cuenta clientes activos del tenant.
   */
  async countActive() {
    const tenantId = getCurrentTenantId();
    return prisma.customer.count({ where: { tenantId, isActive: true } });
  },
};

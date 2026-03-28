import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { CreateEmpleadoDto, UpdateEmpleadoDto, FilterEmpleadoDto } from "./empleado.schema";

/**
 * Repositorio de Empleados — solo queries Prisma, sin logica de negocio.
 */
export const EmpleadoRepository = {
  /**
   * Lista paginada de empleados con filtros opcionales.
   * Search en firstName, lastName, cargo, dui.
   */
  async findAll(filtros: FilterEmpleadoDto) {
    const tenantId = getCurrentTenantId();
    const { search, estado, departamento, page = 1, pageSize = 20 } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EmployeeWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { cargo: { contains: search, mode: "insensitive" } },
          { dui: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(estado && { estado: estado as import("@prisma/client").EstadoEmpleado }),
      ...(departamento && {
        departamento: { contains: departamento, mode: "insensitive" },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca un empleado por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.employee.findFirst({
      where: { id, tenantId },
    });
  },

  /**
   * Lista de empleados activos del tenant (para selects en planilla, sin paginacion).
   */
  async findActivos() {
    const tenantId = getCurrentTenantId();
    return prisma.employee.findMany({
      where: { tenantId, isActive: true, estado: "ACTIVO" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        cargo: true,
        departamento: true,
        salarioBase: true,
        tipoAFP: true,
        exentoISS: true,
        exentoAFP: true,
        exentoRenta: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },

  /**
   * Crea un nuevo empleado.
   */
  async create(data: CreateEmpleadoDto, userId?: string) {
    const tenantId = getCurrentTenantId();
    const uid = userId ?? getCurrentUserId();

    return prisma.employee.create({
      data: {
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        dui: data.dui ?? null,
        nit: data.nit ?? null,
        nss: data.nss ?? null,
        nup: data.nup ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender ?? null,
        cargo: data.cargo,
        departamento: data.departamento ?? null,
        fechaIngreso: new Date(data.fechaIngreso),
        tipoContrato: data.tipoContrato as import("@prisma/client").TipoContrato,
        salarioBase: data.salarioBase,
        tipoAFP: data.tipoAFP as import("@prisma/client").TipoAFP,
        exentoISS: data.exentoISS ?? false,
        exentoAFP: data.exentoAFP ?? false,
        exentoRenta: data.exentoRenta ?? false,
        notes: data.notes ?? null,
        isActive: true,
        createdBy: uid ?? null,
        updatedBy: uid ?? null,
      },
    });
  },

  /**
   * Actualiza un empleado existente.
   */
  async update(id: string, data: UpdateEmpleadoDto, userId?: string) {
    const tenantId = getCurrentTenantId();
    const uid = userId ?? getCurrentUserId();

    return prisma.employee.update({
      where: { id, tenantId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.dui !== undefined && { dui: data.dui }),
        ...(data.nit !== undefined && { nit: data.nit }),
        ...(data.nss !== undefined && { nss: data.nss }),
        ...(data.nup !== undefined && { nup: data.nup }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.cargo !== undefined && { cargo: data.cargo }),
        ...(data.departamento !== undefined && { departamento: data.departamento }),
        ...(data.fechaIngreso !== undefined && {
          fechaIngreso: new Date(data.fechaIngreso),
        }),
        ...(data.tipoContrato !== undefined && {
          tipoContrato: data.tipoContrato as import("@prisma/client").TipoContrato,
        }),
        ...(data.estado !== undefined && {
          estado: data.estado as import("@prisma/client").EstadoEmpleado,
        }),
        ...(data.salarioBase !== undefined && { salarioBase: data.salarioBase }),
        ...(data.tipoAFP !== undefined && {
          tipoAFP: data.tipoAFP as import("@prisma/client").TipoAFP,
        }),
        ...(data.exentoISS !== undefined && { exentoISS: data.exentoISS }),
        ...(data.exentoAFP !== undefined && { exentoAFP: data.exentoAFP }),
        ...(data.exentoRenta !== undefined && { exentoRenta: data.exentoRenta }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: uid ?? null,
      },
    });
  },

  /**
   * Soft delete de un empleado.
   */
  async softDelete(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.employee.update({
      where: { id, tenantId },
      data: {
        isActive: false,
        estado: "INACTIVO",
        deletedAt: new Date(),
        updatedBy: userId ?? null,
      },
    });
  },
};

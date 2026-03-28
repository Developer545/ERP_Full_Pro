import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { PeriodoFiltros, CreatePeriodoInput } from "./periodo.types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const PeriodoRepository = {
  async findAll(filtros: PeriodoFiltros) {
    const tenantId = getCurrentTenantId();
    const { anio, estado, page = 1, pageSize = 50 } = filtros;

    const where: Prisma.AccountingPeriodWhereInput = {
      tenantId,
      isActive: true,
      ...(anio && { anio }),
      ...(estado && { estado }),
    };

    const [items, total] = await Promise.all([
      prisma.accountingPeriod.findMany({
        where,
        orderBy: [{ anio: "desc" }, { mes: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { entries: true } },
        },
      }),
      prisma.accountingPeriod.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.accountingPeriod.findFirst({
      where: { id, tenantId },
    });
  },

  async findByMes(anio: number, mes: number) {
    const tenantId = getCurrentTenantId();
    return prisma.accountingPeriod.findUnique({
      where: { tenantId_anio_mes: { tenantId, anio, mes } },
    });
  },

  async findAbierto(anio: number, mes: number) {
    const tenantId = getCurrentTenantId();
    return prisma.accountingPeriod.findFirst({
      where: { tenantId, anio, mes, estado: "ABIERTO", isActive: true },
    });
  },

  async create(data: CreatePeriodoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    const { anio, mes } = data;
    const nombre = `${MESES[mes - 1]} ${anio}`;
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    return prisma.accountingPeriod.create({
      data: {
        tenantId,
        nombre,
        anio,
        mes,
        fechaInicio,
        fechaFin,
        estado: "ABIERTO",
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async cerrar(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.accountingPeriod.update({
      where: { id, tenantId },
      data: { estado: "CERRADO", updatedBy: userId },
    });
  },

  async reabrir(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.accountingPeriod.update({
      where: { id, tenantId },
      data: { estado: "ABIERTO", updatedBy: userId },
    });
  },

  async tieneBorradores(id: string): Promise<boolean> {
    const count = await prisma.journalEntry.count({
      where: { periodoId: id, estado: "BORRADOR", isActive: true },
    });
    return count > 0;
  },
};

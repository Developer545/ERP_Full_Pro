import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { CuentaFiltros, CreateCuentaInput, UpdateCuentaInput } from "./cuenta.types";
import type { TipoCuenta, NaturalezaCuenta } from "@prisma/client";

const CUENTA_SELECT = {
  id: true,
  codigo: true,
  nombre: true,
  tipo: true,
  naturaleza: true,
  nivel: true,
  parentId: true,
  permiteMovimiento: true,
  notas: true,
  isActive: true,
  createdAt: true,
  parent: { select: { id: true, codigo: true, nombre: true } },
} as const;

export const CuentaRepository = {
  async findAll(filtros: CuentaFiltros) {
    const tenantId = getCurrentTenantId();
    const { search, tipo, soloMovimiento, page = 1, pageSize = 200 } = filtros;

    const where: Prisma.AccountChartWhereInput = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: "insensitive" } },
          { nombre: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tipo && { tipo }),
      ...(soloMovimiento && { permiteMovimiento: true }),
    };

    const [items, total] = await Promise.all([
      prisma.accountChart.findMany({
        where,
        select: CUENTA_SELECT,
        orderBy: { codigo: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.accountChart.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.accountChart.findFirst({
      where: { id, tenantId },
      select: CUENTA_SELECT,
    });
  },

  async findByCodigoPrefix(prefix: string) {
    const tenantId = getCurrentTenantId();
    return prisma.accountChart.findMany({
      where: { tenantId, codigo: { startsWith: prefix }, isActive: true, permiteMovimiento: true },
      select: { id: true, codigo: true, nombre: true, tipo: true, naturaleza: true },
      orderBy: { codigo: "asc" },
    });
  },

  async create(data: CreateCuentaInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.accountChart.create({
      data: {
        tenantId,
        ...data,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      select: CUENTA_SELECT,
    });
  },

  async update(id: string, data: UpdateCuentaInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.accountChart.update({
      where: { id, tenantId },
      data: { ...data, updatedBy: userId },
      select: CUENTA_SELECT,
    });
  },

  async softDelete(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.accountChart.update({
      where: { id, tenantId },
      data: { isActive: false, deletedAt: new Date(), updatedBy: userId },
    });
  },

  /** Verifica si la cuenta tiene asientos registrados */
  async tieneMovimientos(id: string) {
    const count = await prisma.journalLine.count({ where: { accountId: id } });
    return count > 0;
  },

  /** Importación masiva: crea cuentas que no existan (skip duplicadas) */
  async bulkCreate(
    rows: Array<{
      codigo: string;
      nombre: string;
      tipo: TipoCuenta;
      naturaleza: NaturalezaCuenta;
      nivel: number;
      permiteMovimiento: boolean;
    }>
  ) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    let importadas = 0;
    const errores: Array<{ fila: number; codigo: string; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await prisma.accountChart.upsert({
          where: { tenantId_codigo: { tenantId, codigo: row.codigo } },
          create: {
            tenantId,
            codigo: row.codigo,
            nombre: row.nombre,
            tipo: row.tipo,
            naturaleza: row.naturaleza,
            nivel: row.nivel,
            permiteMovimiento: row.permiteMovimiento,
            isActive: true,
            createdBy: userId,
            updatedBy: userId,
          },
          update: {},
        });
        importadas++;
      } catch (e) {
        errores.push({
          fila: i + 1,
          codigo: row.codigo,
          error: e instanceof Error ? e.message : "Error desconocido",
        });
      }
    }

    return { importadas, errores };
  },

  /** Verifica si el tenant ya tiene cuentas cargadas */
  async count() {
    const tenantId = getCurrentTenantId();
    return prisma.accountChart.count({ where: { tenantId, isActive: true } });
  },
};

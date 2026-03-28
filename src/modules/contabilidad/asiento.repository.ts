import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { AsientoFiltros, CreateAsientoInput, UpdateAsientoInput } from "./asiento.types";

const LINES_INCLUDE = {
  lines: {
    include: {
      account: { select: { id: true, codigo: true, nombre: true, naturaleza: true } },
    },
    orderBy: { orden: "asc" as const },
  },
} as const;

export const AsientoRepository = {
  async findAll(filtros: AsientoFiltros) {
    const tenantId = getCurrentTenantId();
    const { search, estado, desde, hasta, origen, periodoId, page = 1, pageSize = 20 } = filtros;

    const where: Prisma.JournalEntryWhereInput = {
      tenantId,
      isActive: true,
      ...(estado && { estado }),
      ...(origen && { origen }),
      ...(periodoId && { periodoId }),
      ...(search && { concepto: { contains: search, mode: "insensitive" } }),
      ...((desde || hasta) && {
        fecha: {
          ...(desde && { gte: new Date(desde) }),
          ...(hasta && { lte: new Date(hasta + "T23:59:59") }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: LINES_INCLUDE,
        orderBy: [{ anio: "desc" }, { numero: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: LINES_INCLUDE,
    });
  },

  /** Siguiente número correlativo del año */
  async nextNumero(anio: number) {
    const tenantId = getCurrentTenantId();
    const last = await prisma.journalEntry.findFirst({
      where: { tenantId, anio },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });
    return (last?.numero ?? 0) + 1;
  },

  async create(data: CreateAsientoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    const fecha = new Date(data.fecha);
    const anio = fecha.getFullYear();
    const numero = await this.nextNumero(anio);

    const totalDebe = data.lines.reduce((s, l) => s + l.debe, 0);
    const totalHaber = data.lines.reduce((s, l) => s + l.haber, 0);

    return prisma.journalEntry.create({
      data: {
        tenantId,
        numero,
        anio,
        fecha,
        concepto: data.concepto,
        tipo: data.tipo ?? "DIARIO",
        periodoId: data.periodoId ?? null,
        origen: data.origen ?? "MANUAL",
        origenId: data.origenId ?? null,
        totalDebe,
        totalHaber,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
        lines: {
          create: data.lines.map((l, i) => ({
            accountId: l.accountId,
            descripcion: l.descripcion ?? null,
            debe: l.debe,
            haber: l.haber,
            orden: l.orden ?? i,
          })),
        },
      },
      include: LINES_INCLUDE,
    });
  },

  async update(id: string, data: UpdateAsientoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.$transaction(async (tx) => {
      // Eliminar líneas existentes y recrear
      if (data.lines) {
        await tx.journalLine.deleteMany({ where: { entryId: id } });
      }

      const totalDebe = data.lines?.reduce((s, l) => s + l.debe, 0);
      const totalHaber = data.lines?.reduce((s, l) => s + l.haber, 0);

      return tx.journalEntry.update({
        where: { id, tenantId },
        data: {
          ...(data.fecha && { fecha: new Date(data.fecha) }),
          ...(data.concepto && { concepto: data.concepto }),
          ...(totalDebe !== undefined && { totalDebe }),
          ...(totalHaber !== undefined && { totalHaber }),
          updatedBy: userId,
          ...(data.lines && {
            lines: {
              create: data.lines.map((l, i) => ({
                accountId: l.accountId,
                descripcion: l.descripcion ?? null,
                debe: l.debe,
                haber: l.haber,
                orden: l.orden ?? i,
              })),
            },
          }),
        },
        include: LINES_INCLUDE,
      });
    });
  },

  async publicar(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.journalEntry.update({
      where: { id, tenantId },
      data: { estado: "PUBLICADO", updatedBy: userId },
      include: LINES_INCLUDE,
    });
  },

  async anular(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    return prisma.journalEntry.update({
      where: { id, tenantId },
      data: { estado: "ANULADO", isActive: false, deletedAt: new Date(), updatedBy: userId },
    });
  },

  /** Saldos por cuenta para un rango de fechas (Libro Mayor) */
  async getSaldosCuentas(desde: Date, hasta: Date) {
    const tenantId = getCurrentTenantId();

    const lines = await prisma.journalLine.findMany({
      where: {
        entry: {
          tenantId,
          estado: "PUBLICADO",
          fecha: { gte: desde, lte: hasta },
        },
      },
      select: {
        accountId: true,
        debe: true,
        haber: true,
        account: { select: { codigo: true, nombre: true, tipo: true, naturaleza: true } },
      },
    });

    // Agrupar por cuenta
    const mapa = new Map<
      string,
      { codigo: string; nombre: string; tipo: string; naturaleza: string; debe: number; haber: number }
    >();

    for (const l of lines) {
      const existing = mapa.get(l.accountId);
      if (existing) {
        existing.debe += Number(l.debe);
        existing.haber += Number(l.haber);
      } else {
        mapa.set(l.accountId, {
          codigo: l.account.codigo,
          nombre: l.account.nombre,
          tipo: l.account.tipo,
          naturaleza: l.account.naturaleza,
          debe: Number(l.debe),
          haber: Number(l.haber),
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
  },
};

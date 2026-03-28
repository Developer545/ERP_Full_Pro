import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type {
  FiltroPeriodoOFecha,
  FiltroLibroMayor,
  LineaBalanceComprobacion,
  LibroMayorResult,
} from "./reporte.types";

function buildDateFilter(filtros: FiltroPeriodoOFecha) {
  if (filtros.desde || filtros.hasta) {
    return {
      fecha: {
        ...(filtros.desde && { gte: new Date(filtros.desde) }),
        ...(filtros.hasta && { lte: new Date(filtros.hasta + "T23:59:59") }),
      },
    };
  }
  return {};
}

export const ReporteRepository = {
  /** Balance de Comprobación: suma débitos/créditos por cuenta en el rango */
  async balanceComprobacion(
    filtros: FiltroPeriodoOFecha
  ): Promise<LineaBalanceComprobacion[]> {
    const tenantId = getCurrentTenantId();

    const whereEntry = {
      tenantId,
      estado: "PUBLICADO" as const,
      isActive: true,
      ...(filtros.periodoId && { periodoId: filtros.periodoId }),
      ...buildDateFilter(filtros),
    };

    const lines = await prisma.journalLine.findMany({
      where: { entry: whereEntry },
      select: {
        debe: true,
        haber: true,
        account: {
          select: {
            codigo: true,
            nombre: true,
            tipo: true,
            naturaleza: true,
          },
        },
      },
    });

    // Agrupar por cuenta
    const mapa = new Map<
      string,
      { codigo: string; nombre: string; tipo: string; naturaleza: string; debitos: number; creditos: number }
    >();

    for (const l of lines) {
      const key = l.account.codigo;
      const existing = mapa.get(key);
      if (existing) {
        existing.debitos += Number(l.debe);
        existing.creditos += Number(l.haber);
      } else {
        mapa.set(key, {
          codigo: l.account.codigo,
          nombre: l.account.nombre,
          tipo: l.account.tipo,
          naturaleza: l.account.naturaleza,
          debitos: Number(l.debe),
          creditos: Number(l.haber),
        });
      }
    }

    return Array.from(mapa.values())
      .map((c) => ({
        ...c,
        saldoDeudor: c.debitos > c.creditos ? c.debitos - c.creditos : 0,
        saldoAcreedor: c.creditos > c.debitos ? c.creditos - c.debitos : 0,
      }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  },

  /** Libro Mayor: movimientos de una cuenta con saldo acumulado */
  async libroMayor(filtros: FiltroLibroMayor): Promise<LibroMayorResult> {
    const tenantId = getCurrentTenantId();

    const cuenta = await prisma.accountChart.findFirst({
      where: { id: filtros.accountId, tenantId },
      select: { id: true, codigo: true, nombre: true, tipo: true, naturaleza: true },
    });

    if (!cuenta) throw new Error("Cuenta no encontrada");

    // Saldo anterior: movimientos ANTES del rango
    let saldoAnterior = 0;
    if (filtros.desde) {
      const prevLines = await prisma.journalLine.findMany({
        where: {
          accountId: filtros.accountId,
          entry: {
            tenantId,
            estado: "PUBLICADO",
            isActive: true,
            fecha: { lt: new Date(filtros.desde) },
          },
        },
        select: { debe: true, haber: true },
      });
      const totalDebe = prevLines.reduce((s, l) => s + Number(l.debe), 0);
      const totalHaber = prevLines.reduce((s, l) => s + Number(l.haber), 0);
      saldoAnterior =
        cuenta.naturaleza === "DEUDORA"
          ? totalDebe - totalHaber
          : totalHaber - totalDebe;
    }

    // Movimientos en el rango
    const whereEntry = {
      tenantId,
      estado: "PUBLICADO" as const,
      isActive: true,
      ...(filtros.periodoId && { periodoId: filtros.periodoId }),
      ...buildDateFilter(filtros),
    };

    const lines = await prisma.journalLine.findMany({
      where: { accountId: filtros.accountId, entry: whereEntry },
      select: {
        descripcion: true,
        debe: true,
        haber: true,
        entry: { select: { numero: true, fecha: true, concepto: true } },
      },
      orderBy: { entry: { fecha: "asc" } },
    });

    let saldoAcumulado = saldoAnterior;
    const movimientos = lines.map((l) => {
      const debe = Number(l.debe);
      const haber = Number(l.haber);
      const movimiento =
        cuenta.naturaleza === "DEUDORA" ? debe - haber : haber - debe;
      saldoAcumulado += movimiento;
      return {
        fecha: l.entry.fecha.toISOString(),
        numero: l.entry.numero,
        concepto: l.entry.concepto,
        descripcion: l.descripcion,
        debe,
        haber,
        saldoAcumulado,
      };
    });

    const totalDebe = lines.reduce((s, l) => s + Number(l.debe), 0);
    const totalHaber = lines.reduce((s, l) => s + Number(l.haber), 0);

    return {
      cuenta,
      saldoAnterior,
      movimientos,
      totalDebe,
      totalHaber,
      saldoFinal: saldoAcumulado,
    };
  },
};

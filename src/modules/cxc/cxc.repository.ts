import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { CxCFiltros, CreatePagoInput } from "./cxc.types";

/** Include default para listado de CxC */
const CXC_LIST_INCLUDE = {
  customer: {
    select: { id: true, name: true, docNumber: true, email: true },
  },
  invoice: {
    select: { id: true, correlativo: true, tipoDoc: true },
  },
} as const;

/** Include completo para detalle de CxC con pagos */
const CXC_DETAIL_INCLUDE = {
  customer: {
    select: { id: true, name: true, docNumber: true, email: true, phone: true },
  },
  invoice: {
    select: {
      id: true,
      correlativo: true,
      tipoDoc: true,
      total: true,
      createdAt: true,
    },
  },
  payments: {
    orderBy: { createdAt: "desc" as const },
  },
} as const;

/**
 * Repositorio de Cuentas por Cobrar — solo queries Prisma, sin logica de negocio.
 */
export const CxCRepository = {
  /**
   * Lista paginada de CxC con filtros opcionales.
   */
  async getAll(filtros: CxCFiltros) {
    const tenantId = getCurrentTenantId();
    const { customerId, status, from, to, page = 1, pageSize = 20 } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AccountReceivableWhereInput = {
      tenantId,
      ...(customerId && { customerId }),
      ...(status && { status: status as Prisma.EnumCxCStatusFilter }),
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
      prisma.accountReceivable.findMany({
        where,
        include: CXC_LIST_INCLUDE,
        orderBy: { dueDate: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.accountReceivable.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Obtiene una CxC por ID con pagos y relaciones completas.
   */
  async getById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.accountReceivable.findFirst({
      where: { id, tenantId },
      include: CXC_DETAIL_INCLUDE,
    });
  },

  /**
   * Registra un pago en una CxC.
   * TRANSACCION: crea pago, actualiza paid, recalcula balance y status.
   */
  async registrarPago(id: string, data: CreatePagoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.$transaction(async (tx) => {
      // Obtener CxC actual con lock
      const cxc = await tx.accountReceivable.findFirst({
        where: { id, tenantId },
        select: { id: true, amount: true, paid: true, balance: true, status: true },
      });

      if (!cxc) {
        throw new Error("Cuenta por cobrar no encontrada");
      }

      // Calcular nuevos totales
      const nuevoPagado = Number(cxc.paid) + data.amount;
      const nuevoBalance = Number(cxc.amount) - nuevoPagado;

      // Determinar nuevo status
      let nuevoStatus: "PARTIAL" | "PAID";
      if (nuevoBalance <= 0) {
        nuevoStatus = "PAID";
      } else {
        nuevoStatus = "PARTIAL";
      }

      // 1. Crear el pago
      await tx.accountReceivablePayment.create({
        data: {
          accountReceivableId: id,
          amount: data.amount,
          paymentMethod: data.paymentMethod as import("@prisma/client").PaymentMethod,
          reference: data.reference,
          notes: data.notes,
          createdBy: userId,
        },
      });

      // 2. Actualizar CxC con nuevos totales
      const cxcActualizada = await tx.accountReceivable.update({
        where: { id },
        data: {
          paid: nuevoPagado,
          balance: nuevoBalance < 0 ? 0 : nuevoBalance,
          status: nuevoStatus,
          updatedBy: userId,
        },
        include: CXC_DETAIL_INCLUDE,
      });

      return cxcActualizada;
    });
  },

  /**
   * Resumen de totales por status del tenant.
   */
  async getResumen() {
    const tenantId = getCurrentTenantId();
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Pendiente total (PENDING + PARTIAL)
    const [pendienteAgg, vencidoAgg, cobradoMesAgg] = await Promise.all([
      prisma.accountReceivable.aggregate({
        where: {
          tenantId,
          status: { in: ["PENDING", "PARTIAL"] },
        },
        _sum: { balance: true },
      }),
      prisma.accountReceivable.aggregate({
        where: {
          tenantId,
          status: "OVERDUE",
        },
        _sum: { balance: true },
      }),
      prisma.accountReceivable.aggregate({
        where: {
          tenantId,
          status: "PAID",
          updatedAt: { gte: inicioMes },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      pending: Number(pendienteAgg._sum.balance ?? 0),
      overdue: Number(vencidoAgg._sum.balance ?? 0),
      paidThisMonth: Number(cobradoMesAgg._sum.amount ?? 0),
    };
  },

  /**
   * Marca como OVERDUE todas las CxC con dueDate < hoy y status PENDING/PARTIAL.
   * Util para cron job diario.
   */
  async markOverdue() {
    const tenantId = getCurrentTenantId();
    const ahora = new Date();

    return prisma.accountReceivable.updateMany({
      where: {
        tenantId,
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: { lt: ahora },
      },
      data: { status: "OVERDUE" },
    });
  },
};

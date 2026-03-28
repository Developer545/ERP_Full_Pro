import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { CxPFiltros, CreatePagoCxPInput } from "./cxp.types";

/** Include default para listado de CxP */
const CXP_LIST_INCLUDE = {
  supplier: {
    select: { id: true, name: true, nit: true, nrc: true, email: true },
  },
} as const;

/** Include completo para detalle de CxP con pagos */
const CXP_DETAIL_INCLUDE = {
  supplier: {
    select: { id: true, name: true, nit: true, nrc: true, email: true, phone: true },
  },
  payments: {
    orderBy: { createdAt: "desc" as const },
  },
} as const;

/**
 * Repositorio de Cuentas por Pagar — solo queries Prisma, sin logica de negocio.
 */
export const CxPRepository = {
  /**
   * Lista paginada de CxP con filtros opcionales.
   */
  async getAll(filtros: CxPFiltros) {
    const tenantId = getCurrentTenantId();
    const { supplierId, status, from, to, page = 1, pageSize = 20 } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AccountPayableWhereInput = {
      tenantId,
      ...(supplierId && { supplierId }),
      ...(status && { status: status as Prisma.EnumCxPStatusFilter }),
      ...(from || to
        ? {
            fechaEmision: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.accountPayable.findMany({
        where,
        include: CXP_LIST_INCLUDE,
        orderBy: { fechaVencimiento: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.accountPayable.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Obtiene una CxP por ID con pagos y relaciones completas.
   */
  async getById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.accountPayable.findFirst({
      where: { id, tenantId },
      include: CXP_DETAIL_INCLUDE,
    });
  },

  /**
   * Crea una nueva Cuenta por Pagar.
   * montoPendiente se inicializa igual al montoTotal.
   */
  async create(data: {
    supplierId: string;
    purchaseOrderId?: string;
    documento: string;
    descripcion?: string;
    montoTotal: number;
    fechaEmision: string;
    fechaVencimiento: string;
    notes?: string;
  }) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.accountPayable.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        ...(data.purchaseOrderId && { purchaseOrderId: data.purchaseOrderId }),
        documento: data.documento,
        descripcion: data.descripcion,
        montoTotal: data.montoTotal,
        montoPagado: 0,
        montoPendiente: data.montoTotal,
        fechaEmision: new Date(data.fechaEmision),
        fechaVencimiento: new Date(data.fechaVencimiento),
        status: "PENDING",
        notes: data.notes,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      include: CXP_LIST_INCLUDE,
    });
  },

  /**
   * Registra un pago en una CxP.
   * TRANSACCION: crea pago, actualiza montoPagado, recalcula montoPendiente y status.
   */
  async registrarPago(id: string, data: CreatePagoCxPInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.$transaction(async (tx) => {
      // Obtener CxP actual
      const cxp = await tx.accountPayable.findFirst({
        where: { id, tenantId },
        select: {
          id: true,
          montoTotal: true,
          montoPagado: true,
          montoPendiente: true,
          status: true,
        },
      });

      if (!cxp) {
        throw new Error("Cuenta por pagar no encontrada");
      }

      // Calcular nuevos totales
      const nuevoPagado = Number(cxp.montoPagado) + data.amount;
      const nuevoPendiente = Number(cxp.montoTotal) - nuevoPagado;

      // Determinar nuevo status
      let nuevoStatus: "PARTIAL" | "PAID";
      if (nuevoPendiente <= 0) {
        nuevoStatus = "PAID";
      } else {
        nuevoStatus = "PARTIAL";
      }

      // 1. Crear el pago
      await tx.accountPayablePayment.create({
        data: {
          accountPayableId: id,
          amount: data.amount,
          paymentMethod: data.paymentMethod as import("@prisma/client").PaymentMethod,
          reference: data.reference,
          notes: data.notes,
          createdBy: userId,
        },
      });

      // 2. Actualizar CxP con nuevos totales
      const cxpActualizada = await tx.accountPayable.update({
        where: { id },
        data: {
          montoPagado: nuevoPagado,
          montoPendiente: nuevoPendiente < 0 ? 0 : nuevoPendiente,
          status: nuevoStatus,
          updatedBy: userId,
        },
        include: CXP_DETAIL_INCLUDE,
      });

      return cxpActualizada;
    });
  },

  /**
   * Resumen de totales para el dashboard de CxP.
   */
  async getResumen() {
    const tenantId = getCurrentTenantId();
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [pendienteAgg, vencidoAgg, pagadoMesAgg, cantidadPendiente] =
      await Promise.all([
        prisma.accountPayable.aggregate({
          where: {
            tenantId,
            status: { in: ["PENDING", "PARTIAL"] },
          },
          _sum: { montoPendiente: true },
        }),
        prisma.accountPayable.aggregate({
          where: {
            tenantId,
            status: "OVERDUE",
          },
          _sum: { montoPendiente: true },
        }),
        prisma.accountPayable.aggregate({
          where: {
            tenantId,
            status: "PAID",
            updatedAt: { gte: inicioMes },
          },
          _sum: { montoTotal: true },
        }),
        prisma.accountPayable.count({
          where: {
            tenantId,
            status: { in: ["PENDING", "PARTIAL"] },
            fechaVencimiento: { lte: en7Dias },
          },
        }),
      ]);

    return {
      totalPendiente: Number(pendienteAgg._sum.montoPendiente ?? 0),
      totalVencido: Number(vencidoAgg._sum.montoPendiente ?? 0),
      pagosEsteMes: Number(pagadoMesAgg._sum.montoTotal ?? 0),
      cantidadPendiente,
    };
  },

  /**
   * Marca como OVERDUE todas las CxP con fechaVencimiento < hoy y status PENDING/PARTIAL.
   * Util para cron job diario.
   */
  async markOverdue() {
    const tenantId = getCurrentTenantId();
    const ahora = new Date();

    return prisma.accountPayable.updateMany({
      where: {
        tenantId,
        status: { in: ["PENDING", "PARTIAL"] },
        fechaVencimiento: { lt: ahora },
      },
      data: { status: "OVERDUE" },
    });
  },

  /**
   * Soft delete de una CxP.
   */
  async softDelete(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.accountPayable.update({
      where: { id, tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  },
};

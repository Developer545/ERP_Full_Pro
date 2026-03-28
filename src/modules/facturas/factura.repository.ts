import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { type Prisma, PaymentMethod, InvoiceStatus } from "@prisma/client";
import type { CreateFacturaDto, UpdateFacturaDto, FacturaFiltrosDto } from "./factura.schema";

/** Include para listado de facturas */
const FACTURA_LIST_INCLUDE = {
  customer: {
    select: {
      id: true,
      name: true,
      docType: true,
      docNumber: true,
      email: true,
      nit: true,
      nrc: true,
    },
  },
  _count: {
    select: { items: true },
  },
} as const;

/** Include completo para detalle de factura */
const FACTURA_DETAIL_INCLUDE = {
  customer: {
    select: {
      id: true,
      name: true,
      docType: true,
      docNumber: true,
      email: true,
      phone: true,
      address: true,
      nit: true,
      nrc: true,
      actividadEconomica: true,
    },
  },
  items: true,
} as const;

/**
 * Repositorio de Facturas — solo queries Prisma, sin logica de negocio.
 */
export const FacturaRepository = {
  /**
   * Lista paginada de facturas con filtros.
   */
  async findAll(filtros: FacturaFiltrosDto) {
    const tenantId = getCurrentTenantId();
    const { search, status, tipoDoc, from, to, page, pageSize } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InvoiceWhereInput = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { correlativo: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { codigoGeneracion: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status: status as Prisma.EnumInvoiceStatusFilter }),
      ...(tipoDoc && { tipoDoc: tipoDoc as Prisma.EnumTipoDocumentoFilter }),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: FACTURA_LIST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Factura completa por ID (con items y cliente).
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.invoice.findFirst({
      where: { id, tenantId, isActive: true },
      include: FACTURA_DETAIL_INCLUDE,
    });
  },

  /**
   * Crea una factura con sus items en una transaccion atomica.
   */
  async create(
    data: CreateFacturaDto & {
      correlativo: string;
      codigoGeneracion: string;
      subtotal: number;
      descuento: number;
      ivaDebito: number;
      total: number;
      userId: string;
    }
  ) {
    const tenantId = getCurrentTenantId();
    const { items, correlativo, codigoGeneracion, subtotal, descuento, ivaDebito, total, userId, ...rest } = data;

    return prisma.$transaction(async (tx) => {
      // Crear la factura principal
      const factura = await tx.invoice.create({
        data: {
          tenantId,
          correlativo,
          codigoGeneracion,
          subtotal,
          descuento,
          ivaDebito,
          total,
          customerId: rest.customerId ?? null,
          tipoDoc: rest.tipoDoc,
          paymentMethod: rest.paymentMethod as PaymentMethod,
          notes: rest.notes ?? null,
          status: "DRAFT",
          createdBy: userId,
          isActive: true,
        },
        include: FACTURA_DETAIL_INCLUDE,
      });

      // Crear los items de la factura
      await tx.invoiceItem.createMany({
        data: items.map((item) => {
          // Precio sin IVA (base gravada): precioConIVA / 1.13
          const baseGravada = item.unitPrice / (1 + item.taxRate);
          const lineSubtotal = baseGravada * item.quantity - item.discount;
          const lineIva = lineSubtotal * item.taxRate;
          const lineTotal = item.unitPrice * item.quantity - item.discount;

          return {
            invoiceId: factura.id,
            productId: item.productId ?? null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            subtotal: Math.max(0, lineSubtotal),
            ivaAmount: Math.max(0, lineIva),
            total: Math.max(0, lineTotal),
          };
        }),
      });

      // Retornar factura con items
      return tx.invoice.findUnique({
        where: { id: factura.id },
        include: FACTURA_DETAIL_INCLUDE,
      });
    });
  },

  /**
   * Actualiza el estado de una factura (flujo DTE).
   */
  async updateStatus(
    id: string,
    status: string,
    selloRecibido?: string,
    userId?: string
  ) {
    const tenantId = getCurrentTenantId();
    return prisma.invoice.update({
      where: { id, tenantId },
      data: {
        status: status as InvoiceStatus,
        ...(selloRecibido !== undefined ? { selloRecibido } : {}),
        ...(userId ? { updatedBy: userId } : {}),
      },
    });
  },

  /**
   * Actualiza notas u otros campos editables de una factura.
   */
  async update(id: string, data: Partial<{ notes: string; status: InvoiceStatus }>, userId?: string) {
    const tenantId = getCurrentTenantId();
    return prisma.invoice.update({
      where: { id, tenantId },
      data: {
        ...data,
        ...(userId ? { updatedBy: userId } : {}),
      },
      include: FACTURA_DETAIL_INCLUDE,
    });
  },

  /**
   * Obtiene el ultimo correlativo para un tipo de documento en el tenant.
   * Retorna 0 si no hay facturas previas.
   */
  async getLastCorrelativo(tipoDoc: string): Promise<number> {
    const tenantId = getCurrentTenantId();
    const last = await prisma.invoice.findFirst({
      where: { tenantId, tipoDoc: tipoDoc as Prisma.EnumTipoDocumentoFilter },
      orderBy: { createdAt: "desc" },
      select: { correlativo: true },
    });

    if (!last) return 0;

    // El correlativo tiene formato "000001", extraer el numero
    const num = parseInt(last.correlativo, 10);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Retorna la suma de total e ivaDebito para un mes/year dado.
   * Util para dashboard de ventas.
   */
  async getTotalesMes(year: number, month: number) {
    const tenantId = getCurrentTenantId();
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await prisma.invoice.aggregate({
      where: {
        tenantId,
        isActive: true,
        status: { notIn: ["CANCELLED"] },
        createdAt: { gte: inicio, lte: fin },
      },
      _sum: {
        total: true,
        ivaDebito: true,
      },
      _count: { id: true },
    });

    return {
      totalVentas: Number(result._sum.total ?? 0),
      ivaDebito: Number(result._sum.ivaDebito ?? 0),
      cantidad: result._count.id,
    };
  },
};

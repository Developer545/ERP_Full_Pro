import crypto from "crypto";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import { prisma } from "@/lib/prisma/client";
import { FacturaRepository } from "./factura.repository";
import type { CreateFacturaDto, FacturaFiltrosDto } from "./factura.schema";

/** IVA estándar El Salvador */
const IVA_RATE = 0.13;

/**
 * Formatea un numero a correlativo de 6 digitos: 1 → "000001"
 */
function formatCorrelativo(n: number): string {
  return String(n).padStart(6, "0");
}

/**
 * Calcula los totales de una factura a partir de sus items.
 * Los precios se ingresan CON IVA incluido (precio de venta al publico).
 */
function calcularTotales(
  items: CreateFacturaDto["items"],
  descuentoGlobal: number = 0
) {
  let subtotalBase = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const taxRate = item.taxRate ?? IVA_RATE;
    // Precio sin IVA (base gravada por unidad)
    const baseGravada = item.unitPrice / (1 + taxRate);
    // Subtotal de la linea (base gravada * qty - descuento linea)
    const lineaSubtotal = baseGravada * item.quantity - item.discount;
    const lineaIva = Math.max(0, lineaSubtotal) * taxRate;

    subtotalBase += Math.max(0, lineaSubtotal);
    ivaTotal += lineaIva;
  }

  const subtotal = Math.round(subtotalBase * 100) / 100;
  const ivaDebito = Math.round(ivaTotal * 100) / 100;
  const descuento = Math.round(descuentoGlobal * 100) / 100;
  const total = Math.round((subtotalBase + ivaTotal - descuento) * 100) / 100;

  return { subtotal, ivaDebito, descuento, total };
}

/**
 * Servicio de Facturas — logica de negocio DTE El Salvador.
 */
export const FacturaService = {
  /**
   * Lista paginada de facturas con filtros.
   */
  async getAll(filtros: FacturaFiltrosDto) {
    return FacturaRepository.findAll(filtros);
  },

  /**
   * Obtiene una factura por ID. Lanza NOT_FOUND si no existe.
   */
  async getById(id: string) {
    const factura = await FacturaRepository.findById(id);
    if (!factura) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Factura no encontrada", 404);
    }
    return factura;
  },

  /**
   * Crea una nueva factura DTE con los siguientes pasos:
   * 1. Calcula subtotal, IVA y total de cada item
   * 2. Genera correlativo auto-incremental por tipo de documento
   * 3. Genera codigoGeneracion (UUID v4 para Ministerio de Hacienda)
   * 4. Crea factura + items en transaccion
   * 5. Descuenta stock (solo CCF y CF)
   * 6. Crea AccountReceivable si paymentMethod === CREDIT
   */
  async create(data: CreateFacturaDto) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    // 1. Calcular totales
    const { subtotal, ivaDebito, descuento, total } = calcularTotales(
      data.items,
      data.discount ?? 0
    );

    // 2. Generar correlativo (ultimo + 1 para este tipo de doc)
    const lastCorrelativo = await FacturaRepository.getLastCorrelativo(data.tipoDoc);
    const correlativo = formatCorrelativo(lastCorrelativo + 1);

    // 3. Generar codigoGeneracion (UUID para MH)
    const codigoGeneracion = crypto.randomUUID().toUpperCase();

    // 4. Crear factura + items en transaccion (dentro del repository)
    const factura = await FacturaRepository.create({
      ...data,
      correlativo,
      codigoGeneracion,
      subtotal,
      descuento,
      ivaDebito,
      total,
      userId,
    });

    if (!factura) {
      throw new AppError(ErrorCodes.INTERNAL, "Error al crear la factura", 500);
    }

    // 5. Descontar stock solo para CCF y CF (ventas normales)
    if (data.tipoDoc === "CCF" || data.tipoDoc === "CF") {
      await this._descontarStock(factura.id, data.items, tenantId, userId);
    }

    // 6. Crear CxC si el pago es a credito
    if (data.paymentMethod === "CREDIT" && data.customerId) {
      await this._crearCuentaPorCobrar(factura.id, data.customerId, total, tenantId, userId);
    }

    return factura;
  },

  /**
   * Cancela una factura (soft — cambia status a CANCELLED).
   * Solo se pueden cancelar facturas en estado DRAFT o SENT.
   */
  async cancel(id: string) {
    const userId = getCurrentUserId();
    const factura = await this.getById(id);

    if (factura.status === "CANCELLED") {
      throw new AppError(
        ErrorCodes.INVOICE_ALREADY_CANCELLED,
        "La factura ya fue cancelada",
        409
      );
    }

    if (factura.status === "ACCEPTED") {
      throw new AppError(
        "INVOICE_ACCEPTED",
        "No se puede cancelar una factura ya aceptada por el MH. Debe emitir una Nota de Credito.",
        422
      );
    }

    return FacturaRepository.updateStatus(id, "CANCELLED", undefined, userId);
  },

  /**
   * Retorna el resumen de ventas del mes actual y el mes anterior.
   */
  async getResumenMes() {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = ahora.getMonth() + 1; // 1-12

    // Mes anterior
    const mesAnteriorYear = month === 1 ? year - 1 : year;
    const mesAnterior = month === 1 ? 12 : month - 1;

    const [mesActual, mesAnt] = await Promise.all([
      FacturaRepository.getTotalesMes(year, month),
      FacturaRepository.getTotalesMes(mesAnteriorYear, mesAnterior),
    ]);

    return {
      mesActual,
      mesAnterior: mesAnt,
    };
  },

  // ─── Helpers privados ──────────────────────────────────────────────────────

  /**
   * Descuenta el stock de cada producto incluido en la factura.
   * Registra un movimiento de inventario por cada item.
   */
  async _descontarStock(
    invoiceId: string,
    items: CreateFacturaDto["items"],
    tenantId: string,
    userId: string
  ) {
    for (const item of items) {
      if (!item.productId) continue;

      // Obtener stock actual
      const product = await prisma.product.findFirst({
        where: { id: item.productId, tenantId },
        select: { id: true, stock: true, trackStock: true, name: true },
      });

      if (!product || !product.trackStock) continue;

      const stockAnterior = Number(product.stock);
      const nuevoStock = stockAnterior - item.quantity;

      // Actualizar stock
      await prisma.product.update({
        where: { id: product.id, tenantId },
        data: { stock: nuevoStock },
      });

      // Registrar movimiento de inventario
      await prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: product.id,
          type: "EXIT",
          quantity: -item.quantity, // negativo = salida
          unitCost: 0, // no aplica para salida por venta
          previousStock: stockAnterior,
          newStock: nuevoStock,
          referenceType: "INVOICE",
          referenceId: invoiceId,
          reason: `Venta — ${item.description}`,
          createdBy: userId,
        },
      });
    }
  },

  /**
   * Crea una cuenta por cobrar para facturas a credito (30 dias por defecto).
   */
  async _crearCuentaPorCobrar(
    invoiceId: string,
    customerId: string,
    total: number,
    tenantId: string,
    userId: string
  ) {
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 30); // 30 dias de credito por defecto

    await prisma.accountReceivable.create({
      data: {
        tenantId,
        customerId,
        invoiceId,
        amount: total,
        paid: 0,
        balance: total,
        dueDate: vencimiento,
        status: "PENDING",
        createdBy: userId,
        isActive: true,
      },
    });
  },
};

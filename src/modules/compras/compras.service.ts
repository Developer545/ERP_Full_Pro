import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { getCurrentUserId } from "@/lib/tenant/context";
import { ComprasRepository } from "./compras.repository";
import type { CreateCompraSchemaDto, CompraFiltrosSchemaDto, RecibirItemSchemaDto } from "./compras.schema";

/** IVA estandar El Salvador */
const IVA_RATE = 0.13;

/**
 * Calcula los totales de una OC a partir de sus items.
 * Los costos se ingresan SIN IVA incluido (costo de compra al proveedor).
 */
function calcularTotalesOC(items: CreateCompraSchemaDto["items"]) {
  let subtotalBase = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const taxRate = item.taxRate ?? IVA_RATE;
    // Subtotal de la linea: costo * qty - descuento
    const lineaSubtotal = item.unitCost * item.quantity - (item.discount ?? 0);
    const lineaIva = Math.max(0, lineaSubtotal) * taxRate;

    subtotalBase += Math.max(0, lineaSubtotal);
    ivaTotal += lineaIva;
  }

  const subtotal = Math.round(subtotalBase * 100) / 100;
  const iva = Math.round(ivaTotal * 100) / 100;
  const total = Math.round((subtotalBase + ivaTotal) * 100) / 100;

  return { subtotal, descuento: 0, iva, total };
}

/**
 * Servicio de Ordenes de Compra — logica de negocio.
 */
export const ComprasService = {
  /**
   * Lista paginada de OC con filtros.
   */
  async getAll(filtros: CompraFiltrosSchemaDto) {
    const { items, total } = await ComprasRepository.findAll(filtros);
    return {
      data: items,
      meta: {
        total,
        page: filtros.page,
        pageSize: filtros.pageSize,
        totalPages: Math.ceil(total / filtros.pageSize),
      },
    };
  },

  /**
   * Obtiene una OC por ID. Lanza NOT_FOUND si no existe.
   */
  async getById(id: string) {
    const oc = await ComprasRepository.findById(id);
    if (!oc) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Orden de compra no encontrada", 404);
    }
    return oc;
  },

  /**
   * Crea una nueva orden de compra:
   * 1. Calcula subtotal, IVA y total de cada item
   * 2. Genera numero correlativo (OC-00000001) automatico
   * 3. Crea OC + items en transaccion
   */
  async create(data: CreateCompraSchemaDto) {
    const userId = getCurrentUserId();

    // Calcular totales
    const { subtotal, descuento, iva, total } = calcularTotalesOC(data.items);

    const oc = await ComprasRepository.create({
      ...data,
      subtotal,
      descuento,
      iva,
      total,
      userId,
    });

    if (!oc) {
      throw new AppError(ErrorCodes.INTERNAL, "Error al crear la orden de compra", 500);
    }

    return oc;
  },

  /**
   * Recibe mercaderia de una OC.
   * Valida que la OC exista y no este cancelada o ya recibida completamente.
   */
  async recibirOrden(id: string, data: RecibirItemSchemaDto) {
    const userId = getCurrentUserId();
    const oc = await this.getById(id);

    if (oc.status === "CANCELLED") {
      throw new AppError(
        "OC_CANCELLED",
        "No se puede recibir mercaderia de una OC cancelada",
        409
      );
    }

    if (oc.status === "RECEIVED") {
      throw new AppError(
        "OC_ALREADY_RECEIVED",
        "Esta orden de compra ya fue recibida completamente",
        409
      );
    }

    return ComprasRepository.recibirOrden(id, data.items, userId);
  },

  /**
   * Cancela una OC (soft — cambia status a CANCELLED).
   * Solo se pueden cancelar OC en estado DRAFT o SENT.
   */
  async cancel(id: string) {
    const userId = getCurrentUserId();
    const oc = await this.getById(id);

    if (oc.status === "CANCELLED") {
      throw new AppError(
        "OC_ALREADY_CANCELLED",
        "La orden de compra ya fue cancelada",
        409
      );
    }

    if (oc.status === "RECEIVED") {
      throw new AppError(
        "OC_ALREADY_RECEIVED",
        "No se puede cancelar una OC ya recibida",
        422
      );
    }

    if (oc.status === "PARTIAL") {
      throw new AppError(
        "OC_PARTIAL_RECEIVED",
        "No se puede cancelar una OC con recepcion parcial. Contacte al administrador.",
        422
      );
    }

    return ComprasRepository.updateStatus(id, "CANCELLED", userId);
  },

  /**
   * Soft delete de una OC.
   * Solo aplica en status DRAFT.
   */
  async delete(id: string) {
    const userId = getCurrentUserId();
    const oc = await this.getById(id);

    if (oc.status !== "DRAFT") {
      throw new AppError(
        "OC_CANNOT_DELETE",
        "Solo se pueden eliminar ordenes en estado Borrador",
        422
      );
    }

    return ComprasRepository.softDelete(id, userId);
  },

  /**
   * Retorna KPIs del modulo de compras.
   */
  async getKPIs() {
    return ComprasRepository.getKPIs();
  },
};

import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { CxPRepository } from "./cxp.repository";
import type { CxPFiltros, CreatePagoCxPInput } from "./cxp.types";
import type { CreateCxPDto } from "./cxp.schema";

/**
 * Servicio de Cuentas por Pagar — logica de negocio y validaciones.
 */
export const CxPService = {
  /**
   * Lista paginada de CxP con filtros.
   */
  async getAll(filtros: CxPFiltros) {
    return CxPRepository.getAll(filtros);
  },

  /**
   * Obtiene una CxP por ID con sus pagos.
   * Lanza NOT_FOUND si no existe en el tenant.
   */
  async getById(id: string) {
    const cxp = await CxPRepository.getById(id);
    if (!cxp) {
      throw new AppError(
        ErrorCodes.NOT_FOUND,
        "Cuenta por pagar no encontrada",
        404
      );
    }
    return cxp;
  },

  /**
   * Crea una nueva Cuenta por Pagar.
   */
  async create(data: CreateCxPDto) {
    return CxPRepository.create(data);
  },

  /**
   * Registra un pago en una CxP.
   * Valida que el monto no exceda el saldo pendiente.
   */
  async registrarPago(id: string, data: CreatePagoCxPInput) {
    // Obtener la CxP y verificar que existe
    const cxp = await this.getById(id);

    // Validar que no este cancelada ni pagada ya
    if (cxp.status === "PAID") {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Esta cuenta por pagar ya esta completamente pagada",
        400
      );
    }

    if (cxp.status === "CANCELLED") {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "No se pueden registrar pagos en una cuenta cancelada",
        400
      );
    }

    // Validar que el monto no exceda el saldo pendiente
    const pendiente = Number(cxp.montoPendiente);
    if (data.amount > pendiente) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `El monto del pago ($${data.amount.toFixed(2)}) supera el saldo pendiente ($${pendiente.toFixed(2)})`,
        400,
        { pendiente, amountRequested: data.amount }
      );
    }

    return CxPRepository.registrarPago(id, data);
  },

  /**
   * Resumen de totales por estado para el dashboard.
   */
  async getResumen() {
    return CxPRepository.getResumen();
  },

  /**
   * Marca como vencidas las CxP con fechaVencimiento pasada.
   * Se llama desde cron job diario.
   */
  async markOverdue() {
    return CxPRepository.markOverdue();
  },

  /**
   * Elimina suavemente una CxP (soft delete).
   * Solo se puede eliminar si no tiene pagos registrados.
   */
  async delete(id: string) {
    const cxp = await this.getById(id);

    if (cxp.payments && cxp.payments.length > 0) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "No se puede eliminar una cuenta con pagos registrados",
        400
      );
    }

    return CxPRepository.softDelete(id);
  },
};

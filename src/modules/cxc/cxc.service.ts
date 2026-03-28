import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { CxCRepository } from "./cxc.repository";
import type { CxCFiltros, CreatePagoInput } from "./cxc.types";

/**
 * Servicio de Cuentas por Cobrar — logica de negocio y validaciones.
 */
export const CxCService = {
  /**
   * Lista paginada de CxC con filtros.
   */
  async getAll(filtros: CxCFiltros) {
    return CxCRepository.getAll(filtros);
  },

  /**
   * Obtiene una CxC por ID con sus pagos.
   * Lanza NOT_FOUND si no existe en el tenant.
   */
  async getById(id: string) {
    const cxc = await CxCRepository.getById(id);
    if (!cxc) {
      throw new AppError(
        ErrorCodes.NOT_FOUND,
        "Cuenta por cobrar no encontrada",
        404
      );
    }
    return cxc;
  },

  /**
   * Registra un pago en una CxC.
   * Valida que el monto no exceda el balance pendiente.
   */
  async registrarPago(id: string, data: CreatePagoInput) {
    // Obtener la CxC y verificar que existe
    const cxc = await this.getById(id);

    // Validar que no este cancelada ni pagada ya
    if (cxc.status === "PAID") {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Esta cuenta por cobrar ya esta completamente pagada",
        400
      );
    }

    if (cxc.status === "CANCELLED") {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "No se pueden registrar pagos en una cuenta cancelada",
        400
      );
    }

    // Validar que el monto no exceda el balance
    const balance = Number(cxc.balance);
    if (data.amount > balance) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `El monto del pago ($${data.amount.toFixed(2)}) supera el saldo pendiente ($${balance.toFixed(2)})`,
        400,
        { balance, amountRequested: data.amount }
      );
    }

    return CxCRepository.registrarPago(id, data);
  },

  /**
   * Resumen de totales por estado para el dashboard.
   */
  async getResumen() {
    return CxCRepository.getResumen();
  },

  /**
   * Marca como vencidas las CxC con dueDate pasada.
   * Se llama desde cron job diario.
   */
  async markOverdue() {
    return CxCRepository.markOverdue();
  },
};

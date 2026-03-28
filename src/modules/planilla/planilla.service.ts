import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { getCurrentUserId } from "@/lib/tenant/context";
import { PlanillaRepository } from "./planilla.repository";
import type { GenerarPlanillaDto, FiltroPlanillaDto } from "./planilla.schema";

/**
 * Servicio de Planilla — logica de negocio.
 */
export const PlanillaService = {
  /**
   * Lista planillas del tenant con filtros opcionales.
   */
  async getAll(filtros: Partial<FiltroPlanillaDto> = {}) {
    return PlanillaRepository.findAll(filtros);
  },

  /**
   * Obtiene una planilla por ID con detalles de empleados.
   * Lanza NOT_FOUND si no existe.
   */
  async getById(id: string) {
    const planilla = await PlanillaRepository.findById(id);
    if (!planilla) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Planilla no encontrada", 404);
    }
    return planilla;
  },

  /**
   * Genera una nueva planilla para el periodo indicado.
   * Lanza error si ya existe planilla para ese mes/anio.
   */
  async generar(data: GenerarPlanillaDto) {
    const userId = getCurrentUserId();
    const planilla = await PlanillaRepository.generar(data, userId);
    if (!planilla) {
      throw new AppError(ErrorCodes.INTERNAL, "Error al generar la planilla", 500);
    }
    return planilla;
  },

  /**
   * Cierra una planilla (BORRADOR → CERRADA).
   * Valida que la planilla exista y este en estado BORRADOR.
   */
  async cerrar(id: string) {
    const userId = getCurrentUserId();
    const planilla = await this.getById(id);

    if (planilla.estado !== "BORRADOR") {
      throw new AppError(
        "PLANILLA_YA_CERRADA",
        "La planilla ya fue cerrada o pagada",
        409
      );
    }

    return PlanillaRepository.cerrar(id, userId);
  },

  /**
   * Elimina una planilla (soft delete).
   * Solo aplica en estado BORRADOR.
   */
  async delete(id: string) {
    const userId = getCurrentUserId();
    // La validacion de estado se hace en el repository
    return PlanillaRepository.softDelete(id, userId);
  },
};

import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { EmpleadoRepository } from "./empleado.repository";
import type { CreateEmpleadoDto, UpdateEmpleadoDto, FilterEmpleadoDto } from "./empleado.schema";

/**
 * Servicio de Empleados — orquesta el repository con logica de negocio.
 */
export const EmpleadoService = {
  /**
   * Lista paginada de empleados con filtros.
   */
  async list(filtros: FilterEmpleadoDto) {
    return EmpleadoRepository.findAll(filtros);
  },

  /**
   * Obtiene un empleado por ID.
   * Lanza NOT_FOUND si no existe en el tenant.
   */
  async getById(id: string) {
    const empleado = await EmpleadoRepository.findById(id);
    if (!empleado) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Empleado no encontrado", 404);
    }
    return empleado;
  },

  /**
   * Lista empleados activos del tenant para selects (sin paginacion).
   */
  async getActivos() {
    return EmpleadoRepository.findActivos();
  },

  /**
   * Crea un nuevo empleado.
   */
  async create(data: CreateEmpleadoDto, userId?: string) {
    return EmpleadoRepository.create(data, userId);
  },

  /**
   * Actualiza un empleado existente.
   */
  async update(id: string, data: UpdateEmpleadoDto, userId?: string) {
    await this.getById(id);
    return EmpleadoRepository.update(id, data, userId);
  },

  /**
   * Soft delete de un empleado.
   */
  async delete(id: string) {
    await this.getById(id);
    return EmpleadoRepository.softDelete(id);
  },
};

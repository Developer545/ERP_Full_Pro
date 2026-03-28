import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { GastosRepository } from "./gastos.repository";
import type { GastosFiltros, CreateGastoInput, UpdateGastoInput, CreateCategoriaInput } from "./gastos.types";
import type { CreateGastoDto, UpdateGastoDto, CreateCategoriaDto } from "./gastos.schema";

/**
 * Servicio de Gastos — logica de negocio y validaciones.
 */
export const GastosService = {
  /**
   * Lista paginada de gastos con filtros.
   */
  async getAll(filtros: GastosFiltros) {
    return GastosRepository.findAll(filtros);
  },

  /**
   * Obtiene un gasto por ID.
   * Lanza NOT_FOUND si no existe en el tenant.
   */
  async getById(id: string) {
    const gasto = await GastosRepository.findById(id);
    if (!gasto) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Gasto no encontrado", 404);
    }
    return gasto;
  },

  /**
   * Crea un nuevo gasto.
   */
  async create(data: CreateGastoDto) {
    return GastosRepository.create(data as CreateGastoInput);
  },

  /**
   * Actualiza un gasto existente.
   */
  async update(id: string, data: UpdateGastoDto) {
    // Verificar que existe
    await this.getById(id);
    return GastosRepository.update(id, data as UpdateGastoInput);
  },

  /**
   * Elimina suavemente un gasto (soft delete).
   */
  async delete(id: string) {
    await this.getById(id);
    return GastosRepository.softDelete(id);
  },

  /**
   * Totales del mes actual por categoria.
   */
  async getTotalesMes(year: number, month: number) {
    return GastosRepository.getTotalesMes(year, month);
  },

  /**
   * Lista categorias activas del tenant.
   */
  async getCategorias() {
    return GastosRepository.getCategorias();
  },

  /**
   * Crea una nueva categoria de gasto.
   * Valida que no exista otra con el mismo nombre en el tenant.
   */
  async createCategoria(data: CreateCategoriaDto) {
    return GastosRepository.createCategoria(data as CreateCategoriaInput);
  },
};

import { AppError } from "@/lib/errors/app-error";
import { PeriodoRepository } from "./periodo.repository";
import type { CreatePeriodoDto } from "./periodo.schema";
import type { PeriodoFiltros } from "./periodo.types";

export const PeriodoService = {
  async getAll(filtros: PeriodoFiltros) {
    return PeriodoRepository.findAll(filtros);
  },

  async getById(id: string) {
    const periodo = await PeriodoRepository.findById(id);
    if (!periodo) throw new AppError("NOT_FOUND", "Período no encontrado", 404);
    return periodo;
  },

  async create(data: CreatePeriodoDto) {
    const existente = await PeriodoRepository.findByMes(data.anio, data.mes);
    if (existente) {
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];
      throw new AppError(
        "PERIODO_DUPLICADO",
        `Ya existe el período ${meses[data.mes - 1]} ${data.anio}`,
        409
      );
    }
    return PeriodoRepository.create(data);
  },

  async cerrar(id: string) {
    const periodo = await this.getById(id);
    if (periodo.estado === "CERRADO") {
      throw new AppError("PERIODO_YA_CERRADO", "El período ya está cerrado", 409);
    }
    const tieneBorradores = await PeriodoRepository.tieneBorradores(id);
    if (tieneBorradores) {
      throw new AppError(
        "PERIODO_CON_BORRADORES",
        "No se puede cerrar: hay asientos en estado Borrador en este período",
        409
      );
    }
    return PeriodoRepository.cerrar(id);
  },

  async reabrir(id: string) {
    const periodo = await this.getById(id);
    if (periodo.estado === "ABIERTO") {
      throw new AppError("PERIODO_YA_ABIERTO", "El período ya está abierto", 409);
    }
    return PeriodoRepository.reabrir(id);
  },
};

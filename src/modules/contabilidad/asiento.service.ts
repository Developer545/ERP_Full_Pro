import { AppError } from "@/lib/errors/app-error";
import { AsientoRepository } from "./asiento.repository";
import type { CreateAsientoDto, UpdateAsientoDto } from "./asiento.schema";
import type { AsientoFiltros, CreateAsientoInput } from "./asiento.types";

export const AsientoService = {
  async getAll(filtros: AsientoFiltros) {
    return AsientoRepository.findAll(filtros);
  },

  async getById(id: string) {
    const asiento = await AsientoRepository.findById(id);
    if (!asiento) throw new AppError("NOT_FOUND", "Asiento no encontrado", 404);
    return asiento;
  },

  async create(data: CreateAsientoDto) {
    return AsientoRepository.create(data as CreateAsientoInput);
  },

  async update(id: string, data: UpdateAsientoDto) {
    const asiento = await this.getById(id);
    if (asiento.estado !== "BORRADOR") {
      throw new AppError(
        "ASIENTO_NO_EDITABLE",
        "Solo se pueden editar asientos en estado Borrador",
        409
      );
    }
    return AsientoRepository.update(id, data);
  },

  async publicar(id: string) {
    const asiento = await this.getById(id);
    if (asiento.estado !== "BORRADOR") {
      throw new AppError("ASIENTO_YA_PROCESADO", "El asiento ya fue publicado o anulado", 409);
    }
    return AsientoRepository.publicar(id);
  },

  async anular(id: string) {
    const asiento = await this.getById(id);
    if (asiento.estado === "ANULADO") {
      throw new AppError("ASIENTO_YA_ANULADO", "El asiento ya está anulado", 409);
    }
    return AsientoRepository.anular(id);
  },

  async getSaldosCuentas(desde: string, hasta: string) {
    return AsientoRepository.getSaldosCuentas(new Date(desde), new Date(hasta + "T23:59:59"));
  },
};

import { AppError } from "@/lib/errors/app-error";
import { CuentaRepository } from "./cuenta.repository";
import type { CreateCuentaDto, UpdateCuentaDto } from "./cuenta.schema";
import type { CuentaFiltros } from "./cuenta.types";

export const CuentaService = {
  async getAll(filtros: CuentaFiltros) {
    return CuentaRepository.findAll(filtros);
  },

  async getById(id: string) {
    const cuenta = await CuentaRepository.findById(id);
    if (!cuenta) throw new AppError("NOT_FOUND", "Cuenta no encontrada", 404);
    return cuenta;
  },

  async create(data: CreateCuentaDto) {
    return CuentaRepository.create(data);
  },

  async update(id: string, data: UpdateCuentaDto) {
    await this.getById(id);
    return CuentaRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    const tieneMovimientos = await CuentaRepository.tieneMovimientos(id);
    if (tieneMovimientos) {
      throw new AppError("CUENTA_CON_MOVIMIENTOS",
        "No se puede eliminar: la cuenta tiene asientos registrados",
        409
      );
    }
    return CuentaRepository.softDelete(id);
  },
};

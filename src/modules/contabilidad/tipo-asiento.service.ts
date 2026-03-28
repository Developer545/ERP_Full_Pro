import { AppError } from "@/lib/errors/app-error";
import { TipoAsientoRepository } from "./tipo-asiento.repository";
import type { CreateTipoAsientoDto } from "./tipo-asiento.schema";

export const TipoAsientoService = {
  async getAll() {
    return TipoAsientoRepository.findAll();
  },

  async create(data: CreateTipoAsientoDto) {
    const todos = await TipoAsientoRepository.findAll();
    const existe = todos.find(
      (t) => t.nombre.toUpperCase() === data.nombre.toUpperCase()
    );
    if (existe) {
      throw new AppError("TIPO_DUPLICADO", `El tipo "${data.nombre}" ya existe`, 409);
    }
    return TipoAsientoRepository.create(data);
  },

  async delete(id: string) {
    const tipo = await TipoAsientoRepository.findById(id);
    if (!tipo) throw new AppError("NOT_FOUND", "Tipo de asiento no encontrado", 404);
    if (!tipo.tenantId) {
      throw new AppError(
        "TIPO_SISTEMA",
        "No se pueden eliminar los tipos predefinidos del sistema",
        403
      );
    }
    return TipoAsientoRepository.delete(id);
  },
};

import { AppError } from "@/lib/errors/app-error";
import { CuentaRepository } from "./cuenta.repository";
import type { CreateCuentaDto, UpdateCuentaDto } from "./cuenta.schema";
import type { CuentaFiltros, ImportarCuentaRow, ImportarResult } from "./cuenta.types";
import { CATALOGO_ESTANDAR_SV } from "./catalogo-estandar";
import type { TipoCuenta, NaturalezaCuenta } from "@prisma/client";

const TIPOS_VALIDOS = ["ACTIVO", "PASIVO", "CAPITAL", "PATRIMONIO", "INGRESO", "COSTO", "GASTO", "CIERRE", "ORDEN_DEUDORA", "ORDEN_ACREEDORA"];
const NATURALEZAS_VALIDAS = ["DEUDORA", "ACREEDORA"];

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

  /** Importa cuentas desde un array (viene de Excel/JSON parseado en el cliente) */
  async importarCatalogo(rows: ImportarCuentaRow[]): Promise<ImportarResult> {
    const erroresValidacion: Array<{ fila: number; codigo: string; error: string }> = [];
    const filas: Array<{
      codigo: string;
      nombre: string;
      tipo: TipoCuenta;
      naturaleza: NaturalezaCuenta;
      nivel: number;
      permiteMovimiento: boolean;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.codigo || !row.nombre) {
        erroresValidacion.push({ fila: i + 1, codigo: row.codigo ?? "", error: "Código y nombre son requeridos" });
        continue;
      }
      if (!TIPOS_VALIDOS.includes(row.tipo?.toUpperCase())) {
        erroresValidacion.push({ fila: i + 1, codigo: row.codigo, error: `Tipo inválido: "${row.tipo}"` });
        continue;
      }
      if (!NATURALEZAS_VALIDAS.includes(row.naturaleza?.toUpperCase())) {
        erroresValidacion.push({ fila: i + 1, codigo: row.codigo, error: `Naturaleza inválida: "${row.naturaleza}"` });
        continue;
      }
      filas.push({
        codigo: row.codigo.trim(),
        nombre: row.nombre.trim(),
        tipo: row.tipo.toUpperCase() as TipoCuenta,
        naturaleza: row.naturaleza.toUpperCase() as NaturalezaCuenta,
        nivel: row.nivel ?? 1,
        permiteMovimiento: row.permiteMovimiento !== false,
      });
    }

    if (erroresValidacion.length > 0 && filas.length === 0) {
      return { importadas: 0, errores: erroresValidacion };
    }

    const resultado = await CuentaRepository.bulkCreate(filas);
    return {
      importadas: resultado.importadas,
      errores: [...erroresValidacion, ...resultado.errores],
    };
  },

  /** Devuelve el catálogo estándar PYMES El Salvador sin importarlo */
  getCatalogoEstandar() {
    return CATALOGO_ESTANDAR_SV;
  },

  /** Importa el catálogo estándar SV directamente al tenant */
  async importarCatalogoEstandar(): Promise<ImportarResult> {
    const total = await CuentaRepository.count();
    if (total > 0) {
      throw new AppError(
        "CATALOGO_YA_EXISTE",
        "El tenant ya tiene cuentas registradas. Usa la importación manual para agregar cuentas individuales.",
        409
      );
    }
    return CuentaRepository.bulkCreate(CATALOGO_ESTANDAR_SV);
  },
};

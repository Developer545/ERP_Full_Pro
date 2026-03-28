import type { TipoCuenta, NaturalezaCuenta } from "@prisma/client";

export interface CuentaFiltros {
  search?: string;
  tipo?: TipoCuenta;
  parentId?: string | null;
  soloMovimiento?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateCuentaInput {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel: number;
  parentId?: string | null;
  permiteMovimiento?: boolean;
  notas?: string | null;
}

export type UpdateCuentaInput = Partial<CreateCuentaInput>;

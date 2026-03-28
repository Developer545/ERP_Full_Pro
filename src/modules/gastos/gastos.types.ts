/**
 * Tipos del modulo de Gastos.
 */

/** Categoria de gasto */
export interface GastoCategoria {
  id: string;
  name: string;
  color?: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Gasto registrado */
export interface GastoRow {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  category?: GastoCategoria | null;
  descripcion: string;
  monto: number;
  paymentMethod: string;
  reference?: string | null;
  fecha: string;
  comprobanteUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Total por categoria para el mes */
export interface GastoTotalCategoria {
  categoryId: string | null;
  categoryName: string;
  color?: string | null;
  total: number;
}

/** Resumen KPIs del mes */
export interface GastosTotalesMes {
  totalMes: number;
  gastoMayor: { descripcion: string; monto: number } | null;
  porCategoria: GastoTotalCategoria[];
}

/** Filtros para listar gastos */
export interface GastosFiltros {
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
}

/** Input para crear un gasto */
export interface CreateGastoInput {
  categoryId?: string;
  descripcion: string;
  monto: number;
  paymentMethod: string;
  reference?: string;
  fecha: string;
  notes?: string;
}

/** Input para actualizar un gasto */
export type UpdateGastoInput = Partial<CreateGastoInput>;

/** Input para crear una categoria de gasto */
export interface CreateCategoriaInput {
  name: string;
  color?: string;
}

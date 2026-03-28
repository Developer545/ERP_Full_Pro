/**
 * Tipos del modulo de Inventario / Kardex.
 */

/** Tipos de movimiento de inventario */
export type MovementType =
  | "ENTRY"
  | "EXIT"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "INITIAL"
  | "RETURN";

/** Input para crear un movimiento de inventario */
export interface CreateMovementInput {
  productId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

/** Filtros para listar movimientos */
export interface InventarioFiltros {
  productId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Resumen de stock por producto */
export interface StockResumen {
  productId: string;
  name: string;
  sku?: string | null;
  stock: number;
  minStock: number;
  isLow: boolean;
}

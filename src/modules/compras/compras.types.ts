/**
 * Tipos TypeScript para el modulo de Compras (Ordenes de Compra).
 */

/** Item de una orden de compra */
export interface CompraItem {
  productId?: string;
  description: string;
  quantity: number;
  unitCost: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  ivaAmount: number;
  total: number;
  quantityReceived?: number;
}

/** Datos para crear una nueva orden de compra */
export interface CreateCompraDto {
  supplierId: string;
  reference?: string;
  fechaEsperada?: string;
  items: CompraItem[];
  notes?: string;
}

/** Filtros para listado de ordenes de compra */
export interface CompraFiltrosDto {
  search?: string;
  status?: string;
  supplierId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

/** Item para marcar recepcion de mercaderia */
export interface RecibirItem {
  itemId: string;
  quantityReceived: number;
}

/** Totales calculados de una orden de compra */
export interface CompraTotales {
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
}

/** Proveedor resumido para listas */
export interface SupplierResumen {
  id: string;
  name: string;
  nit?: string | null;
  email?: string | null;
}

/** Item calculado con totales */
export interface CompraItemCalculado extends CompraItem {
  id?: string;
}

/** Estructura completa de una OC con relaciones */
export interface CompraCompleta {
  id: string;
  numero: string;
  reference?: string | null;
  status: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  fechaOrden: Date;
  fechaEsperada?: Date | null;
  fechaRecibida?: Date | null;
  notes?: string | null;
  supplier: SupplierResumen;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitCost: number;
    discount: number;
    taxRate: number;
    subtotal: number;
    ivaAmount: number;
    total: number;
    quantityReceived: number;
    productId?: string | null;
  }[];
}

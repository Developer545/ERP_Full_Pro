/**
 * Tipos del modulo de Cuentas por Pagar (CxP).
 */

/** Estados posibles de una cuenta por pagar */
export type CxPStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

/** Input para registrar un pago en una CxP */
export interface CreatePagoCxPInput {
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

/** Alias exportado para compatibilidad con el schema Zod */
export type RegistrarPagoCxPDto = CreatePagoCxPInput;

/** Filtros para listar CxP */
export interface CxPFiltros {
  supplierId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Alias exportado para compatibilidad con el schema Zod */
export type CxPFiltrosDto = CxPFiltros;

/** Informacion del proveedor dentro de una CxP */
export interface CxPSupplier {
  id: string;
  name: string;
  nit?: string | null;
  nrc?: string | null;
  email?: string | null;
  phone?: string | null;
}

/** Pago registrado dentro de una CxP */
export interface CxPPayment {
  id: string;
  accountPayableId: string;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

/** Fila para la tabla UI del modulo CxP */
export interface CxPRow {
  id: string;
  supplierId: string;
  supplier: CxPSupplier;
  purchaseOrderId?: string | null;
  documento: string;
  descripcion?: string | null;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  status: CxPStatus;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  payments?: CxPPayment[];
}

/** Resumen de KPIs para el dashboard de CxP */
export interface CxPResumen {
  totalPendiente: number;
  totalVencido: number;
  pagosEsteMes: number;
  cantidadPendiente: number;
}

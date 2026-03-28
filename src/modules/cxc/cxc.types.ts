/**
 * Tipos del modulo de Cuentas por Cobrar (CxC).
 */

/** Estados posibles de una cuenta por cobrar */
export type CxCStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

/** Input para registrar un pago en una CxC */
export interface CreatePagoInput {
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

/** Alias exportado para compatibilidad con el schema Zod */
export type RegistrarPagoDto = CreatePagoInput;

/** Filtros para listar CxC */
export interface CxCFiltros {
  customerId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Alias exportado para compatibilidad con el schema Zod */
export type CxCFiltrosDto = CxCFiltros;

/** Informacion del cliente dentro de una CxC */
export interface CxCCustomer {
  id: string;
  name: string;
  docNumber?: string | null;
  email?: string | null;
  phone?: string | null;
}

/** Informacion de la factura vinculada a una CxC */
export interface CxCInvoice {
  id: string;
  correlativo?: string | null;
  tipoDoc?: string | null;
  total?: number | null;
  createdAt?: string | null;
}

/** Pago registrado dentro de una CxC */
export interface CxCPayment {
  id: string;
  accountReceivableId: string;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

/** Fila para la tabla UI del modulo CxC */
export interface CxCRow {
  id: string;
  customerId: string;
  customer: CxCCustomer;
  invoiceId?: string | null;
  invoice?: CxCInvoice | null;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: CxCStatus;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  payments?: CxCPayment[];
}

/**
 * Tipos TypeScript para el modulo de Facturas DTE El Salvador.
 */

/** Item de una factura (linea de detalle) */
export interface FacturaItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

/** Datos para crear una nueva factura */
export interface CreateFacturaInput {
  customerId?: string;
  tipoDoc: "CCF" | "CF" | "NC" | "ND";
  items: FacturaItem[];
  paymentMethod: string;
  notes?: string;
  discount?: number;
}

/** Filtros para listado de facturas */
export interface FacturaFiltros {
  search?: string;
  status?: string;
  tipoDoc?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Item calculado con totales */
export interface FacturaItemCalculado extends FacturaItem {
  subtotal: number;
  ivaAmount: number;
  total: number;
}

/** Totales de una factura */
export interface FacturaTotales {
  subtotal: number;
  descuento: number;
  ivaDebito: number;
  total: number;
}

/** Configuracion DTE del tenant para generacion de documentos */
export interface TenantDTEConfig {
  nit: string;
  nrc: string;
  nombre: string;
  nombreComercial?: string;
  codActividad: string;
  descActividad: string;
  tipoEstablec: string;
  direccion: {
    departamento: string;
    municipio: string;
    complemento: string;
  };
  telefono?: string;
  correo: string;
  passwordPri: string;
  codigoEstablecimiento: string; // MH - MXXXXXXX
  ambiente: "00" | "01"; // 00=pruebas, 01=produccion
}

/** Estructura completa de una factura con relaciones (para DTE) */
export interface FacturaCompleta {
  id: string;
  tipoDoc: "CCF" | "CF" | "NC" | "ND";
  correlativo: string;
  codigoGeneracion: string;
  selloRecibido?: string | null;
  subtotal: number;
  descuento: number;
  ivaDebito: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: Date;
  customer?: {
    id: string;
    name: string;
    docType: string;
    docNumber?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    nit?: string | null;
    nrc?: string | null;
    actividadEconomica?: string | null;
  } | null;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    subtotal: number;
    ivaAmount: number;
    total: number;
    productId?: string | null;
  }[];
}

/** Resumen mensual de ventas */
export interface ResumenMes {
  mesActual: {
    totalVentas: number;
    ivaDebito: number;
    cantidad: number;
  };
  mesAnterior: {
    totalVentas: number;
    ivaDebito: number;
    cantidad: number;
  };
}

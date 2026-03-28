/**
 * Constantes globales del ERP Full Pro.
 */

export const APP_NAME = "ERP Full Pro";
export const APP_VERSION = "1.0.0";
export const APP_COMPANY = "Speeddan System";

/** Paginacion default */
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/** Cache TTL en segundos */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minuto — datos muy cambiantes (POS, stock)
  MEDIUM: 300,      // 5 minutos — listas (clientes, proveedores)
  LONG: 1800,       // 30 minutos — catalogos (categorias, impuestos)
  VERY_LONG: 3600,  // 1 hora — datos de configuracion
} as const;

/** Planes disponibles */
export const PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

/** Roles de usuario */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  VIEWER: "VIEWER",
} as const;

/** Formato de fechas consistente */
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm";
export const TIME_FORMAT = "HH:mm";

/** Moneda El Salvador */
export const CURRENCY = {
  CODE: "USD",
  SYMBOL: "$",
  DECIMALS: 2,
} as const;

/** IVA El Salvador */
export const IVA_RATE = 0.13; // 13%

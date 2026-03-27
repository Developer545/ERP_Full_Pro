/**
 * Feature flags por plan.
 * Controla que modulos estan disponibles segun el plan del tenant.
 * Para habilitar un modulo: agregarlo al array de plans.
 */

export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export const FEATURES = {
  POS: {
    plans: ["FREE", "BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Punto de venta",
  },
  INVOICING: {
    plans: ["FREE", "BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Facturacion DTE",
  },
  INVENTORY: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Inventario y Kardex",
  },
  PURCHASES: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Compras y proveedores",
  },
  CXC: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Cuentas por cobrar",
  },
  CXP: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Cuentas por pagar",
  },
  EXPENSES: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Gastos",
  },
  PAYROLL: {
    plans: ["PRO", "ENTERPRISE"] as Plan[],
    description: "Planilla SV (ISSS/AFP/Renta)",
  },
  ACCOUNTING: {
    plans: ["PRO", "ENTERPRISE"] as Plan[],
    description: "Contabilidad (asientos, libros, EEFF)",
  },
  REPORTS: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Reportes avanzados",
  },
  BULK_IMPORT: {
    plans: ["PRO", "ENTERPRISE"] as Plan[],
    description: "Importacion masiva desde Excel",
  },
  TWO_FACTOR: {
    plans: ["BASIC", "PRO", "ENTERPRISE"] as Plan[],
    description: "Autenticacion de dos factores",
  },
  AUDIT_LOG: {
    plans: ["PRO", "ENTERPRISE"] as Plan[],
    description: "Historial de auditoria",
  },
  API_ACCESS: {
    plans: ["ENTERPRISE"] as Plan[],
    description: "API REST publica",
  },
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Verifica si un plan tiene acceso a un feature
 * @example hasFeature("BASIC", "PAYROLL") // false
 * @example hasFeature("PRO", "PAYROLL") // true
 */
export function hasFeature(tenantPlan: Plan, feature: FeatureKey): boolean {
  return (FEATURES[feature].plans as Plan[]).includes(tenantPlan);
}

/**
 * Limites de recursos por plan
 */
export const PLAN_LIMITS = {
  FREE: {
    maxUsers: 2,
    maxProducts: 50,
    maxInvoicesPerMonth: 20,
    maxStorageMB: 100,
  },
  BASIC: {
    maxUsers: 5,
    maxProducts: 500,
    maxInvoicesPerMonth: 200,
    maxStorageMB: 1024,
  },
  PRO: {
    maxUsers: 20,
    maxProducts: 5000,
    maxInvoicesPerMonth: 2000,
    maxStorageMB: 5120,
  },
  ENTERPRISE: {
    maxUsers: 999,
    maxProducts: 999999,
    maxInvoicesPerMonth: 999999,
    maxStorageMB: 20480,
  },
} as const;

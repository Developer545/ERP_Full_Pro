import type { Plan } from "@/config/features";

/**
 * Tipos relacionados con tenants (empresas) y suscripciones
 */

export type TenantStatus =
  | "ACTIVE"
  | "TRIAL"
  | "SUSPENDED"
  | "CANCELLED"
  | "PENDING_DELETION";

/** Configuracion general de la empresa */
export interface TenantSettings {
  currency: string; // "USD"
  timezone: string; // "America/El_Salvador"
  dateFormat: string; // "DD/MM/YYYY"
  logo?: string; // URL de Cloudinary
  primaryColor?: string;
}

/** Configuracion DTE El Salvador */
export interface DTEConfig {
  nit: string;
  nrc: string;
  actividadEconomica: string;
  codigoActividad: string;
  tokenMH: string; // Token del Ministerio de Hacienda
  ambiente: "00" | "01"; // 00=testing, 01=produccion
  correlativoCCF: number;
  correlativoCF: number;
  correlativoNC: number;
  correlativoND: number;
}

/** Tenant completo */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status: TenantStatus;
  settings: TenantSettings;
  dteConfig?: DTEConfig;
  maxUsers: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
  trialEndsAt?: Date;
  createdAt: Date;
}

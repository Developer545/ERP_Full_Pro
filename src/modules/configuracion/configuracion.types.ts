/**
 * Tipos TypeScript para el modulo de Configuracion del Tenant.
 */

export interface TenantSettings {
  // Informacion de la empresa
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  logo?: string;
  // Moneda y formato
  moneda?: string;
  timezone?: string;
}

export interface DTEConfig {
  // Datos fiscales El Salvador
  nit?: string;
  nrc?: string;
  actividadEconomica?: string;
  codActividad?: string;
  direccionFiscal?: string;
  // MH credenciales
  usuarioMH?: string;
  // Ambiente
  ambiente?: "00" | "01"; // 00=Pruebas, 01=Produccion
}

export interface UpdateConfiguracionInput {
  // Tab Empresa
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  // Tab DTE (se guarda en dteConfig JSON)
  dte?: DTEConfig;
}

export interface ConfiguracionResponse {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings: TenantSettings;
  dteConfig: DTEConfig | null;
  maxUsers: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

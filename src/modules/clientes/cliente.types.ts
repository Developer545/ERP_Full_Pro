/**
 * Tipos TypeScript para el modulo de Clientes.
 */

export type DocType = "DUI" | "NIT" | "PASAPORTE" | "NRC" | "OTRO";

export interface Cliente {
  id: string;
  tenantId: string;
  name: string;
  docType: DocType;
  docNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  department?: string | null;
  country: string;
  nit?: string | null;
  nrc?: string | null;
  actividadEconomica?: string | null;
  creditLimit: number;
  creditDays: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export interface CreateClienteInput {
  name: string;
  docType?: DocType;
  docNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  nit?: string;
  nrc?: string;
  actividadEconomica?: string;
  creditLimit?: number;
  creditDays?: number;
  notes?: string;
}

export interface UpdateClienteInput extends Partial<CreateClienteInput> {
  isActive?: boolean;
}

export interface ClienteFilterParams {
  search?: string;
  docType?: DocType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

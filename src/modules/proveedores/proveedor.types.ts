/**
 * Tipos TypeScript para el modulo de Proveedores.
 */

export interface Proveedor {
  id: string;
  tenantId: string;
  name: string;
  nit?: string | null;
  nrc?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactName?: string | null;
  paymentDays: number;
  creditLimit: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export interface CreateProveedorInput {
  name: string;
  nit?: string;
  nrc?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  paymentDays?: number;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> {
  isActive?: boolean;
}

export interface ProveedorFilterParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

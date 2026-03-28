/**
 * Tipos TypeScript para el modulo de Empleados.
 */

export interface EmpleadoRow {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  dui?: string | null;
  nit?: string | null;
  nss?: string | null;
  nup?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  cargo: string;
  departamento?: string | null;
  fechaIngreso: string;
  tipoContrato: string;
  estado: string;
  salarioBase: number;
  tipoAFP: string;
  exentoISS: boolean;
  exentoAFP: boolean;
  exentoRenta: boolean;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpleadoFiltros {
  search?: string;
  estado?: string;
  departamento?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateEmpleadoInput {
  firstName: string;
  lastName: string;
  dui?: string;
  nit?: string;
  nss?: string;
  nup?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  cargo: string;
  departamento?: string;
  fechaIngreso: string;
  tipoContrato: string;
  salarioBase: number;
  tipoAFP: string;
  exentoISS?: boolean;
  exentoAFP?: boolean;
  exentoRenta?: boolean;
  notes?: string;
}

export type UpdateEmpleadoInput = Partial<CreateEmpleadoInput>;

/**
 * Tipos TypeScript para el modulo de Categorias.
 */

export interface Categoria {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  _count?: {
    products: number;
  };
}

export interface CategoriaListItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt: Date;
  productCount: number;
}

export interface CreateCategoriaInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoriaInput {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface CategoriaFilterParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

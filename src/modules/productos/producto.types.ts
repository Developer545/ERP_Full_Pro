/**
 * Tipos TypeScript para el modulo de Productos.
 */

export interface Producto {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  supplierId?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  unit: string;
  image?: string | null;
  price: number;
  cost: number;
  taxRate: number;
  stock: number;
  minStock: number;
  maxStock?: number | null;
  trackStock: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
}

export interface ProductoListItem {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
}

export interface CreateProductoInput {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  categoryId?: string;
}

export interface UpdateProductoInput extends Partial<CreateProductoInput> {
  isActive?: boolean;
  barcode?: string;
  image?: string;
  taxRate?: number;
  maxStock?: number;
  trackStock?: boolean;
}

export interface ProductoFilterParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}

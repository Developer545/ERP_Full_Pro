/**
 * Tipos TypeScript para el modulo de Usuarios.
 */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SELLER" | "ACCOUNTANT" | "VIEWER";

export interface Usuario {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface UsuarioListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export interface CreateUsuarioInput {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUsuarioInput {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
}

export interface UsuarioFilterParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

/** Respuesta al crear usuario — incluye contrasena temporal */
export interface CreateUsuarioResponse {
  usuario: UsuarioListItem;
  tempPassword: string;
}

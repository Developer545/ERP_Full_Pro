/**
 * Tipos de autenticacion y sesion
 */

/** Roles disponibles en el sistema */
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SELLER"
  | "ACCOUNTANT"
  | "VIEWER";

/** Payload del JWT (lo que se almacena en el token) */
export interface TokenPayload {
  sub: string; // userId
  tenantId: string;
  tenantSlug: string;
  role: UserRole;
  email: string;
  name: string;
  type?: "access" | "refresh";
  jti?: string; // JWT ID unico (para refresh tokens)
}

/** Usuario autenticado (disponible en contexto de request) */
export interface AuthUser {
  id: string;
  tenantId: string;
  tenantSlug: string;
  role: UserRole;
  email: string;
  name: string;
}

/** Datos del usuario para el cliente (sin datos sensibles) */
export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
  avatar?: string;
}

/** Respuesta del endpoint de login */
export interface LoginResponse {
  user: ClientUser;
  accessToken: string; // Solo para modo SPA si se necesita
}

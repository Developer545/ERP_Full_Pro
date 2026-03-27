import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAMES } from "./tokens";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import type { AuthUser, UserRole } from "@/types/auth";

/**
 * Extrae y verifica el usuario autenticado desde las cookies de la request.
 * Usar en API routes para obtener el usuario actual.
 *
 * @throws AppError UNAUTHORIZED si no hay token o es invalido
 */
export async function requireAuth(): Promise<AuthUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (!token) {
    throw new AppError(ErrorCodes.UNAUTHORIZED, "No autenticado", 401);
  }

  const payload = await verifyToken(token);

  return {
    id: payload.sub,
    tenantId: payload.tenantId,
    tenantSlug: payload.tenantSlug,
    role: payload.role,
    email: payload.email,
    name: payload.name,
  };
}

/**
 * Verifica que el usuario tenga al menos uno de los roles requeridos.
 * @throws AppError FORBIDDEN si no tiene el rol
 */
export function requireRole(user: AuthUser, roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "No tienes permisos para esta accion",
      403
    );
  }
}

/**
 * Jerarquia de roles (mayor index = mayor permiso)
 * Util para verificar si un rol puede realizar una accion
 */
export const ROLE_HIERARCHY: UserRole[] = [
  "VIEWER",
  "SELLER",
  "ACCOUNTANT",
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

/** Verifica si un rol tiene nivel igual o mayor que el requerido */
export function hasMinimumRole(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}

import { AsyncLocalStorage } from "node:async_hooks";
import { AppError } from "@/lib/errors/app-error";
import type { UserRole } from "@/types/auth";

/**
 * Contexto de request — almacenado en AsyncLocalStorage.
 * Disponible en CUALQUIER funcion llamada dentro de una request,
 * sin necesidad de pasar parametros manualmente.
 */
export interface RequestContext {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  userRole: UserRole;
  userEmail: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Obtiene el tenantId del contexto actual.
 * @throws AppError si no hay contexto activo (llamada fuera de request)
 */
export function getCurrentTenantId(): string {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new AppError(
      "NO_CONTEXT",
      "Contexto de tenant no inicializado",
      500
    );
  }
  return ctx.tenantId;
}

/** Obtiene el userId del contexto actual */
export function getCurrentUserId(): string {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new AppError("NO_CONTEXT", "Contexto de usuario no inicializado", 500);
  }
  return ctx.userId;
}

/** Obtiene el contexto completo */
export function getRequestContext(): RequestContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new AppError("NO_CONTEXT", "Contexto de request no inicializado", 500);
  }
  return ctx;
}

/**
 * Ejecuta una funcion dentro de un contexto de request.
 * Debe llamarse en el API route handler antes de llamar services.
 *
 * @example
 * return runWithContext({ tenantId, userId, ... }, () => ProductService.list());
 */
export function runWithContext<T>(
  ctx: RequestContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return storage.run(ctx, fn);
}

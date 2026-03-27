import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/middleware";
import { runWithContext } from "@/lib/tenant/context";
import { handleApiError } from "@/lib/errors/error-handler";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { prisma } from "@/lib/prisma/client";
import type { AuthUser, UserRole } from "@/types/auth";
import type { Tenant } from "@/types/tenant";

interface WithApiOptions {
  /** Roles permitidos. Si no se especifica, cualquier usuario autenticado puede acceder */
  roles?: UserRole[];
  /** Deshabilitar autenticacion (solo para endpoints publicos) */
  public?: boolean;
}

interface ApiContext {
  user: AuthUser;
  tenant: Tenant;
  params: Record<string, string>;
}

type ApiHandler = (
  req: Request,
  ctx: ApiContext
) => Promise<NextResponse | Response>;

/**
 * Wrapper para API routes que maneja automaticamente:
 * - Autenticacion (JWT desde cookie)
 * - Verificacion de roles
 * - Contexto de tenant (AsyncLocalStorage)
 * - Error handling centralizado
 * - Logging de requests
 *
 * @example
 * export const GET = withApi(async (req, { user, tenant }) => {
 *   const productos = await ProductoService.list(tenant.id);
 *   return NextResponse.json({ data: productos });
 * }, { roles: ["ADMIN", "SELLER"] });
 */
export function withApi(handler: ApiHandler, options: WithApiOptions = {}) {
  return async (
    req: Request,
    segmentData?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse | Response> => {
    try {
      const params = segmentData?.params ? await segmentData.params : {};

      // Endpoint publico — sin auth
      if (options.public) {
        return await handler(req, { user: {} as AuthUser, tenant: {} as Tenant, params });
      }

      // 1. Verificar autenticacion
      const user = await requireAuth();

      // 2. Verificar roles
      if (options.roles) {
        requireRole(user, options.roles);
      }

      // 3. Cargar tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
      });
      if (!tenantRecord || tenantRecord.status === "SUSPENDED") {
        throw new AppError(
          ErrorCodes.FORBIDDEN,
          "Cuenta suspendida o no encontrada",
          403
        );
      }
      const tenant = tenantRecord as unknown as Tenant;

      // 4. Ejecutar handler dentro del contexto de tenant
      return await runWithContext(
        {
          tenantId: user.tenantId,
          tenantSlug: user.tenantSlug,
          userId: user.id,
          userRole: user.role,
          userEmail: user.email,
        },
        () => handler(req, { user, tenant, params })
      );
    } catch (error) {
      return handleApiError(error);
    }
  };
}

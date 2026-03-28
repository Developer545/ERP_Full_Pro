import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { handleApiError } from "@/lib/errors/error-handler";
import { prisma } from "@/lib/prisma/client";

/**
 * GET /api/auth/me
 * Retorna el usuario autenticado actual con datos frescos de BD.
 * Usado por el cliente para verificar sesion y obtener datos actualizados.
 */
export async function GET() {
  try {
    const authUser = await requireAuth();

    // Obtener datos frescos de la BD
    const user = await prisma.user.findFirst({
      where: { id: authUser.id, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        tenantId: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true,
            trialEndsAt: true,
            settings: true,
            maxUsers: true,
            maxProducts: true,
            maxInvoicesPerMonth: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...user,
        tenantSlug: user.tenant.slug,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

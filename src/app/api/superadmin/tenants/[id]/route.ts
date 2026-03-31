import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/errors/error-handler";
import { validateSuperadminKey, unauthorizedResponse } from "@/lib/superadmin-auth";

const TENANT_DETAIL_SELECT = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  status: true,
  settings: true,
  dteConfig: true,
  maxUsers: true,
  maxProducts: true,
  maxInvoicesPerMonth: true,
  trialEndsAt: true,
  subscriptionId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: {
    select: {
      users: true,
      products: true,
    },
  },
} as const;

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!validateSuperadminKey(req)) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const tenant = await prisma.tenant.findFirst({
      where: { id, deletedAt: null },
      select: TENANT_DETAIL_SELECT,
    });

    if (!tenant) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tenant no encontrado" } },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    return handleApiError(error);
  }
}

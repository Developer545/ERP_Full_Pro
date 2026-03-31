import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/errors/error-handler";
import { validateSuperadminKey, unauthorizedResponse } from "@/lib/superadmin-auth";

const TENANT_SELECT = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  status: true,
  maxUsers: true,
  maxProducts: true,
  maxInvoicesPerMonth: true,
  trialEndsAt: true,
  subscriptionId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      users: true,
      products: true,
    },
  },
} as const;

export async function GET(req: NextRequest) {
  try {
    if (!validateSuperadminKey(req)) {
      return unauthorizedResponse();
    }

    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50) || 50));

    const where: Prisma.TenantWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        select: TENANT_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

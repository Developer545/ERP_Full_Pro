import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/errors/error-handler";
import { validateSuperadminKey, unauthorizedResponse } from "@/lib/superadmin-auth";

const PLAN_ORDER = ["FREE", "BASIC", "PRO", "ENTERPRISE"] as const;

export async function GET(req: NextRequest) {
  try {
    if (!validateSuperadminKey(req)) {
      return unauthorizedResponse();
    }

    const [total, statusGroups, planGroups] = await Promise.all([
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.tenant.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.tenant.groupBy({
        by: ["plan"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const statusMap = Object.fromEntries(statusGroups.map((row) => [row.status, row._count.id]));
    const planMap = Object.fromEntries(planGroups.map((row) => [row.plan, row._count.id]));

    const por_plan = Object.fromEntries(
      PLAN_ORDER.map((plan) => [plan, planMap[plan] ?? 0])
    );

    return NextResponse.json({
      total,
      activos: statusMap.ACTIVE ?? 0,
      en_trial: statusMap.TRIAL ?? 0,
      suspendidos: statusMap.SUSPENDED ?? 0,
      cancelados: statusMap.CANCELLED ?? 0,
      por_plan,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

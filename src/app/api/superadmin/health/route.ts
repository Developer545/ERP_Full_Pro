import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { handleApiError } from "@/lib/errors/error-handler";
import { validateSuperadminKey, unauthorizedResponse } from "@/lib/superadmin-auth";

export async function GET(req: NextRequest) {
  try {
    if (!validateSuperadminKey(req)) {
      return unauthorizedResponse();
    }

    const start = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        db_latency_ms: Date.now() - start,
      });
    } catch {
      return NextResponse.json(
        {
          status: "error",
          timestamp: new Date().toISOString(),
          db_latency_ms: Date.now() - start,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

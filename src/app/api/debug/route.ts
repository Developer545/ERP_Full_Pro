import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

/**
 * GET /api/debug — Solo en desarrollo/preview para diagnosticar errores.
 * ELIMINAR antes de ir a produccion real.
 */
export async function GET() {
  try {
    // Test conexion a BD
    const result = await prisma.$queryRaw`SELECT 1 as ok`;

    // Test query usuario
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();

    return NextResponse.json({
      db: "ok",
      result,
      userCount,
      tenantCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlStart: process.env.DATABASE_URL?.slice(0, 30) ?? "MISSING",
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json({
      db: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : [],
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

/**
 * GET /api/debug — Diagnóstico de conexión DB. Eliminar en producción real.
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;

  // Primero mostrar env info sin tocar DB
  const envInfo = {
    hasDbUrl: !!dbUrl,
    dbUrlPrefix: dbUrl?.slice(0, 40) ?? "MISSING",
    hasJwtSecret: !!jwtSecret,
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
  };

  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing", env: envInfo }, { status: 500 });
  }

  // Probar con Prisma client
  try {
    const { prisma } = await import("@/lib/prisma/client");
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();

    return NextResponse.json({
      db: "ok",
      result,
      userCount,
      tenantCount,
      env: envInfo,
    });
  } catch (error) {
    return NextResponse.json({
      db: "error",
      message: error instanceof Error ? error.message : String(error),
      env: envInfo,
    }, { status: 500 });
  }
}

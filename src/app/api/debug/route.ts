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

  // Probar conexión con Neon Pool directo (sin Prisma)
  try {
    const ws = require("ws");
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    neonConfig.webSocketConstructor = ws;

    const pool = new Pool({ connectionString: dbUrl });
    const result = await pool.query("SELECT 1 as ok, NOW() as ts");
    await pool.end();

    return NextResponse.json({
      db: "ok",
      row: result.rows[0],
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

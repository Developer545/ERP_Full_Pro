import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

/**
 * Singleton de Prisma Client con adapter Neon serverless.
 * Compatible con Vercel Edge y funciones serverless.
 *
 * En desarrollo: reutiliza instancia en hot-reload (evita "too many connections")
 * En produccion: crea una sola instancia
 */

// Neon serverless requiere el paquete 'ws' explicitamente en Node.js.
// Node.js 22+ tiene WebSocket nativo pero NO funciona con Neon pooler.
// Siempre usar 'ws' en entornos server (no Edge).
// eslint-disable-next-line @typescript-eslint/no-require-imports
neonConfig.webSocketConstructor = require("ws");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no esta configurada");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = new Pool({ connectionString }) as any;
  const adapter = new PrismaNeon(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

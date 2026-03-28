import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

/**
 * Singleton de Prisma Client con adapter Neon serverless.
 * Compatible con Vercel Edge y funciones serverless.
 *
 * En desarrollo: reutiliza instancia en hot-reload (evita "too many connections")
 * En produccion: crea una sola instancia
 *
 * NOTA: Se usa connectionString directo en PrismaNeon (no Pool)
 * porque la API del adapter en Prisma 7 + @prisma/adapter-neon@7 lo requiere asi.
 */

// Neon serverless requiere ws explicitamente — Node.js 22+ tiene WebSocket nativo
// pero NO es compatible con el cliente Neon. Siempre usar el paquete 'ws'.
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

  // PrismaNeon acepta connectionString directamente en Prisma 7
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon({ connectionString } as any);

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

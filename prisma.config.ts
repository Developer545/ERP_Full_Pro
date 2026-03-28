import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Leer .env.local para que CLI tools (migrate, studio) tengan acceso a DATABASE_URL
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  // .env.local no existe (Vercel) — usar variables de entorno del sistema
}

/**
 * Configuracion de Prisma 7.
 * DATABASE_URL se lee desde .env.local (desarrollo) o variables de entorno (Vercel).
 */
export default defineConfig({
  // @ts-expect-error — earlyAccess es requerido en Prisma 7 (no esta en tipos estables aun)
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async adapter() {
      const { neonConfig, Pool } = await import("@neondatabase/serverless");
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      neonConfig.webSocketConstructor = require("ws");
      const connectionString = process.env.DATABASE_URL!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pool = new Pool({ connectionString }) as any;
      return new PrismaNeon(pool);
    },
  },
});

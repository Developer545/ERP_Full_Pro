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
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async adapter() {
      const { neonConfig, Pool } = await import("@neondatabase/serverless");
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      neonConfig.webSocketConstructor = (await import("ws")).default;
      const connectionString = process.env.DATABASE_URL!;
      const pool = new Pool({ connectionString });
      return new PrismaNeon(pool);
    },
  },
});

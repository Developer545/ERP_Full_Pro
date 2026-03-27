import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Variables de entorno tipadas y validadas con Zod.
 * Si falta alguna variable requerida, el BUILD FALLA — no en runtime.
 * Agregar nuevas variables aqui antes de usarlas en el codigo.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL valida"),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET debe tener minimo 32 caracteres"),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL: z.string().default("7d"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // Upstash Redis (opcional — cache L2)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    // Resend (emails)
    RESEND_API_KEY: z.string().optional(),
    // Cloudinary (imagenes)
    CLOUDINARY_URL: z.string().optional(),
    // Sentry
    SENTRY_DSN: z.string().optional(),
    // Cron jobs (Vercel)
    CRON_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z.string().default("ERP Full Pro"),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL,
    JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL,
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

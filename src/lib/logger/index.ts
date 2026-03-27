import pino from "pino";

/**
 * Logger estructurado con Pino.
 * En desarrollo: output legible con pino-pretty.
 * En produccion: JSON para Vercel Log Drain.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  },
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } }
      : undefined,
});

/**
 * Crea un logger hijo con contexto de modulo.
 * @example const log = getModuleLogger("productos");
 */
export function getModuleLogger(module: string) {
  return logger.child({ module });
}

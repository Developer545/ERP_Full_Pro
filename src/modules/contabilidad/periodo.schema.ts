import { z } from "zod";

export const createPeriodoSchema = z.object({
  anio: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
});

export const filterPeriodosSchema = z.object({
  anio: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : undefined)),
  estado: z.enum(["ABIERTO", "CERRADO"]).optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 50)),
});

export type CreatePeriodoDto = z.infer<typeof createPeriodoSchema>;

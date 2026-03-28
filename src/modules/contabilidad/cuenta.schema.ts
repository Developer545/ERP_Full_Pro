import { z } from "zod";

export const createCuentaSchema = z.object({
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(1).max(200),
  tipo: z.enum(["ACTIVO", "PASIVO", "CAPITAL", "INGRESO", "COSTO", "GASTO"]),
  naturaleza: z.enum(["DEUDORA", "ACREEDORA"]),
  nivel: z.number().int().min(1).max(6),
  parentId: z.string().cuid().nullable().optional(),
  permiteMovimiento: z.boolean().optional().default(true),
  notas: z.string().max(500).nullable().optional(),
});

export const updateCuentaSchema = createCuentaSchema.partial();

export const filterCuentasSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(["ACTIVO", "PASIVO", "CAPITAL", "INGRESO", "COSTO", "GASTO"]).optional(),
  parentId: z.string().optional(),
  soloMovimiento: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 200)),
});

export type CreateCuentaDto = z.infer<typeof createCuentaSchema>;
export type UpdateCuentaDto = z.infer<typeof updateCuentaSchema>;

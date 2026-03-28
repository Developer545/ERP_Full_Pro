import { z } from "zod";

export const lineaSchema = z.object({
  accountId: z.string().cuid(),
  descripcion: z.string().max(300).nullable().optional(),
  debe: z.number().min(0),
  haber: z.number().min(0),
  orden: z.number().int().min(0).optional().default(0),
});

export const createAsientoSchema = z
  .object({
    fecha: z.string().min(1),
    concepto: z.string().min(1).max(500),
    tipo: z.string().max(50).optional().default("DIARIO"),
    periodoId: z.string().nullable().optional(),
    origen: z
      .enum(["MANUAL", "FACTURA_DTE", "COMPRA", "PLANILLA", "GASTO", "AGUINALDO"])
      .optional()
      .default("MANUAL"),
    origenId: z.string().nullable().optional(),
    lines: z.array(lineaSchema).min(2, "Un asiento necesita al menos 2 líneas"),
  })
  .refine(
    (data) => {
      const debe = data.lines.reduce((s, l) => s + l.debe, 0);
      const haber = data.lines.reduce((s, l) => s + l.haber, 0);
      return Math.abs(debe - haber) < 0.01;
    },
    { message: "El asiento no cuadra: Debe ≠ Haber", path: ["lines"] }
  );

export const updateAsientoSchema = z.object({
  fecha: z.string().min(1).optional(),
  concepto: z.string().min(1).max(500).optional(),
  tipo: z.string().max(50).optional(),
  periodoId: z.string().nullable().optional(),
  lines: z.array(lineaSchema).min(2).optional(),
});

export const filterAsientosSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(["BORRADOR", "PUBLICADO", "ANULADO"]).optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  origen: z
    .enum(["MANUAL", "FACTURA_DTE", "COMPRA", "PLANILLA", "GASTO", "AGUINALDO"])
    .optional(),
  periodoId: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 20)),
});

export type CreateAsientoDto = z.infer<typeof createAsientoSchema>;
export type UpdateAsientoDto = z.infer<typeof updateAsientoSchema>;

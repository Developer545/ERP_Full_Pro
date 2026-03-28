import { z } from "zod";

/** Metodos de pago disponibles */
const paymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "TRANSFER",
  "CHECK",
  "CREDIT",
  "MIXED",
]);

/**
 * Schema para crear un gasto.
 */
export const createGastoSchema = z.object({
  categoryId: z.string().optional(),
  descripcion: z
    .string({ required_error: "La descripcion es requerida" })
    .min(1, "La descripcion es requerida")
    .max(500)
    .trim(),
  monto: z
    .number({ required_error: "El monto es requerido" })
    .positive("El monto debe ser mayor a 0"),
  paymentMethod: paymentMethodEnum,
  reference: z.string().max(100).trim().optional(),
  fecha: z.string({ required_error: "La fecha es requerida" }),
  notes: z.string().max(500).trim().optional(),
});

/**
 * Schema para actualizar un gasto.
 */
export const updateGastoSchema = createGastoSchema.partial();

/**
 * Schema para crear una categoria de gasto.
 */
export const createCategoriaSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(100)
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido (formato: #RRGGBB)")
    .optional(),
});

/**
 * Schema para filtros de listado de gastos.
 */
export const filterGastosSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  paymentMethod: z.string().optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default("1"),
  pageSize: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default("20"),
});

export type CreateGastoDto = z.infer<typeof createGastoSchema>;
export type UpdateGastoDto = z.infer<typeof updateGastoSchema>;
export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>;
export type FilterGastosDto = z.infer<typeof filterGastosSchema>;

import { z } from "zod";

/** Tipos de movimiento validos */
const movementTypeEnum = z.enum([
  "ENTRY",
  "EXIT",
  "ADJUSTMENT",
  "TRANSFER",
  "INITIAL",
  "RETURN",
]);

/**
 * Schema para crear un movimiento de inventario manual.
 */
export const createMovementSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  type: movementTypeEnum,
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a 0"),
  unitCost: z.number().nonnegative().optional(),
  reason: z.string().max(500).trim().optional(),
  referenceType: z.string().max(50).trim().optional(),
  referenceId: z.string().max(100).trim().optional(),
});

/** Schema para filtros del listado de movimientos */
export const filterMovimientoSchema = z.object({
  productId: z.string().optional(),
  type: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
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

export type CreateMovementDto = z.infer<typeof createMovementSchema>;
export type FilterMovimientoDto = z.infer<typeof filterMovimientoSchema>;

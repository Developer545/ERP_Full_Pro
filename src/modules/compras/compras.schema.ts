import { z } from "zod";

/** Schema de un item de orden de compra */
export const compraItemSchema = z.object({
  productId: z.string().cuid("ID de producto invalido").optional().nullable(),
  description: z
    .string()
    .min(1, "La descripcion es requerida")
    .max(500, "La descripcion no puede tener mas de 500 caracteres")
    .trim(),
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a 0")
    .max(99999, "Cantidad fuera de rango"),
  unitCost: z
    .number({ required_error: "El costo unitario es requerido" })
    .nonnegative("El costo no puede ser negativo")
    .max(9999999.99, "Costo fuera de rango"),
  discount: z
    .number()
    .nonnegative("El descuento no puede ser negativo")
    .default(0),
  taxRate: z
    .number()
    .min(0, "La tasa de impuesto no puede ser negativa")
    .max(1, "La tasa de impuesto no puede ser mayor a 1")
    .default(0.13),
  subtotal: z.number().nonnegative().default(0),
  ivaAmount: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  quantityReceived: z.number().nonnegative().optional().default(0),
});

/** Schema para crear una orden de compra */
export const createCompraSchema = z.object({
  supplierId: z.string().cuid("ID de proveedor invalido"),
  reference: z
    .string()
    .max(100, "La referencia no puede tener mas de 100 caracteres")
    .trim()
    .optional()
    .nullable(),
  fechaEsperada: z.string().optional().nullable(),
  items: z
    .array(compraItemSchema)
    .min(1, "La orden debe tener al menos un item"),
  notes: z
    .string()
    .max(1000, "Las notas no pueden tener mas de 1000 caracteres")
    .trim()
    .optional()
    .nullable(),
});

/** Schema para actualizar una OC (parcial) */
export const updateCompraSchema = createCompraSchema.partial().extend({
  status: z
    .enum(["DRAFT", "SENT", "PARTIAL", "RECEIVED", "CANCELLED"])
    .optional(),
});

/** Schema para filtros de listado */
export const compraFiltrosSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["DRAFT", "SENT", "PARTIAL", "RECEIVED", "CANCELLED"])
    .optional(),
  supplierId: z.string().optional(),
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

/** Schema para recibir items de una OC */
export const recibirItemSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().cuid("ID de item invalido"),
        quantityReceived: z
          .number()
          .positive("La cantidad recibida debe ser mayor a 0"),
      })
    )
    .min(1, "Debe especificar al menos un item a recibir"),
});

export type CreateCompraSchemaDto = z.infer<typeof createCompraSchema>;
export type UpdateCompraSchemaDto = z.infer<typeof updateCompraSchema>;
export type CompraFiltrosSchemaDto = z.infer<typeof compraFiltrosSchema>;
export type CompraItemSchemaDto = z.infer<typeof compraItemSchema>;
export type RecibirItemSchemaDto = z.infer<typeof recibirItemSchema>;

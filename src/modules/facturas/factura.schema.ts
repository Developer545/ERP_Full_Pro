import { z } from "zod";

/** Tipos de documento DTE El Salvador */
const TIPOS_DOC = ["CCF", "CF", "NC", "ND"] as const;

/** Metodos de pago disponibles */
const METODOS_PAGO = ["CASH", "CARD", "TRANSFER", "CHECK", "CREDIT", "MIXED"] as const;

/** Schema de un item de factura */
export const facturaItemSchema = z.object({
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
  unitPrice: z
    .number({ required_error: "El precio unitario es requerido" })
    .nonnegative("El precio no puede ser negativo")
    .max(9999999.99, "Precio fuera de rango"),
  discount: z
    .number()
    .nonnegative("El descuento no puede ser negativo")
    .default(0),
  taxRate: z
    .number()
    .min(0, "La tasa de impuesto no puede ser negativa")
    .max(1, "La tasa de impuesto no puede ser mayor a 1")
    .default(0.13),
});

/** Schema para crear una factura */
export const createFacturaSchema = z.object({
  customerId: z.string().cuid("ID de cliente invalido").optional().nullable(),
  tipoDoc: z.enum(TIPOS_DOC, {
    required_error: "El tipo de documento es requerido",
    invalid_type_error: "Tipo de documento invalido",
  }),
  items: z
    .array(facturaItemSchema)
    .min(1, "La factura debe tener al menos un item"),
  paymentMethod: z.enum(METODOS_PAGO, {
    required_error: "El metodo de pago es requerido",
    invalid_type_error: "Metodo de pago invalido",
  }),
  notes: z
    .string()
    .max(1000, "Las notas no pueden tener mas de 1000 caracteres")
    .trim()
    .optional()
    .nullable(),
  discount: z
    .number()
    .nonnegative("El descuento no puede ser negativo")
    .optional()
    .default(0),
});

/** Schema para actualizar una factura (parcial) */
export const updateFacturaSchema = createFacturaSchema.partial().extend({
  status: z
    .enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"])
    .optional(),
  selloRecibido: z.string().optional().nullable(),
});

/** Schema para filtros de listado */
export const facturaFiltrosSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"]).optional(),
  tipoDoc: z.enum(TIPOS_DOC).optional(),
  from: z.string().optional(), // fecha ISO: "2024-01-01"
  to: z.string().optional(),   // fecha ISO: "2024-12-31"
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

export type CreateFacturaDto = z.infer<typeof createFacturaSchema>;
export type UpdateFacturaDto = z.infer<typeof updateFacturaSchema>;
export type FacturaFiltrosDto = z.infer<typeof facturaFiltrosSchema>;
export type FacturaItemDto = z.infer<typeof facturaItemSchema>;

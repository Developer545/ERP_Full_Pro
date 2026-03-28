import { z } from "zod";

/**
 * Schema de validacion Zod para cada item del carrito.
 */
export const cartItemSchema = z.object({
  productId: z.string().min(1, "ID de producto requerido"),
  sku: z.string().default(""),
  name: z.string().min(1, "Nombre del producto requerido"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().positive("El precio unitario debe ser mayor a 0"),
  discount: z.number().min(0, "El descuento no puede ser negativo").max(100, "El descuento no puede superar 100%").default(0),
  taxRate: z.number().min(0).max(1).default(0.13),
  subtotal: z.number().min(0),
  ivaAmount: z.number().min(0),
  total: z.number().min(0),
});

/**
 * Schema de validacion Zod para procesar una venta POS.
 */
export const posVentaSchema = z.object({
  customerId: z.string().optional(),
  tipoDoc: z.enum(["CCF", "CF"], {
    required_error: "El tipo de documento es requerido",
    invalid_type_error: "Tipo de documento invalido",
  }),
  items: z
    .array(cartItemSchema)
    .min(1, "El carrito debe tener al menos un producto"),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "MIXED", "CREDIT"], {
    required_error: "El metodo de pago es requerido",
  }),
  amountReceived: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  // CCF requiere cliente con NIT/NRC
  if (data.tipoDoc === "CCF" && !data.customerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Para CCF se requiere seleccionar un cliente",
      path: ["customerId"],
    });
  }
  // Efectivo requiere monto recibido
  if (data.paymentMethod === "CASH" && data.amountReceived === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Para pago en efectivo se requiere el monto recibido",
      path: ["amountReceived"],
    });
  }
});

export type PosVentaDto = z.infer<typeof posVentaSchema>;
export type CartItemDto = z.infer<typeof cartItemSchema>;

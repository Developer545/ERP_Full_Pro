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
 * Schema para registrar un pago en una CxP.
 */
export const createPagoCxPSchema = z.object({
  amount: z
    .number({ required_error: "El monto es requerido" })
    .positive("El monto debe ser mayor a 0"),
  paymentMethod: paymentMethodEnum,
  reference: z.string().max(100).trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

/**
 * Schema para crear una nueva CxP.
 */
export const createCxPSchema = z.object({
  supplierId: z.string({ required_error: "El proveedor es requerido" }),
  purchaseOrderId: z.string().optional(),
  documento: z
    .string({ required_error: "El documento es requerido" })
    .min(1)
    .max(100)
    .trim(),
  descripcion: z.string().max(500).trim().optional(),
  montoTotal: z
    .number({ required_error: "El monto total es requerido" })
    .positive("El monto debe ser mayor a 0"),
  fechaEmision: z.string({ required_error: "La fecha de emision es requerida" }),
  fechaVencimiento: z.string({
    required_error: "La fecha de vencimiento es requerida",
  }),
  notes: z.string().max(500).trim().optional(),
});

/** Schema para filtros de listado de CxP */
export const filterCxPSchema = z.object({
  supplierId: z.string().optional(),
  status: z.string().optional(),
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

export type CreatePagoCxPDto = z.infer<typeof createPagoCxPSchema>;
export type CreateCxPDto = z.infer<typeof createCxPSchema>;
export type FilterCxPDto = z.infer<typeof filterCxPSchema>;

/** Alias para compatibilidad con la especificacion del modulo */
export type RegistrarPagoCxPDto = CreatePagoCxPDto;
export type CxPFiltrosDto = FilterCxPDto;

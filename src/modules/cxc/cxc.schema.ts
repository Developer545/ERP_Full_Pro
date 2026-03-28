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
 * Schema para registrar un pago en una CxC.
 */
export const createPagoSchema = z.object({
  amount: z
    .number({ required_error: "El monto es requerido" })
    .positive("El monto debe ser mayor a 0"),
  paymentMethod: paymentMethodEnum,
  reference: z.string().max(100).trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

/** Schema para filtros de listado de CxC */
export const filterCxCSchema = z.object({
  customerId: z.string().optional(),
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

export type CreatePagoDto = z.infer<typeof createPagoSchema>;
export type FilterCxCDto = z.infer<typeof filterCxCSchema>;

/** Alias para compatibilidad con la especificacion del modulo */
export type RegistrarPagoDto = CreatePagoDto;
export type CxCFiltrosDto = FilterCxCDto;

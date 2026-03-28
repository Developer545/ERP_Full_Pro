import { z } from "zod";

/** Tipos de documento disponibles */
export const DOC_TYPES = ["DUI", "NIT", "PASAPORTE", "NRC", "OTRO"] as const;

/** Schema para crear un cliente */
export const createClienteSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede tener mas de 200 caracteres")
    .trim(),
  docType: z.enum(DOC_TYPES).optional().default("DUI"),
  docNumber: z.string().max(50).trim().optional().nullable(),
  email: z.string().email("Email invalido").optional().nullable(),
  phone: z.string().max(20).trim().optional().nullable(),
  address: z.string().max(500).trim().optional().nullable(),
  city: z.string().max(100).trim().optional().nullable(),
  department: z.string().max(100).trim().optional().nullable(),
  nit: z.string().max(20).trim().optional().nullable(),
  nrc: z.string().max(20).trim().optional().nullable(),
  actividadEconomica: z.string().max(200).trim().optional().nullable(),
  creditLimit: z.number().nonnegative().optional().default(0),
  creditDays: z.number().int().nonnegative().optional().default(0),
  notes: z.string().max(1000).trim().optional().nullable(),
});

/** Schema para actualizar un cliente */
export const updateClienteSchema = createClienteSchema.partial().extend({
  isActive: z.boolean().optional(),
});

/** Schema para filtros de listado */
export const filterClienteSchema = z.object({
  search: z.string().optional(),
  docType: z.enum(DOC_TYPES).optional(),
  isActive: z
    .string()
    .transform((v) => v === "true" ? true : v === "false" ? false : undefined)
    .optional(),
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

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
export type FilterClienteDto = z.infer<typeof filterClienteSchema>;

import { z } from "zod";

/** Schema para crear un proveedor */
export const createProveedorSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede tener mas de 200 caracteres")
    .trim(),
  nit: z.string().max(20).trim().optional().nullable(),
  nrc: z.string().max(20).trim().optional().nullable(),
  email: z.string().email("Email invalido").optional().nullable(),
  phone: z.string().max(20).trim().optional().nullable(),
  address: z.string().max(500).trim().optional().nullable(),
  contactName: z.string().max(200).trim().optional().nullable(),
  paymentDays: z.number().int().nonnegative().optional().default(0),
  creditLimit: z.number().nonnegative().optional().default(0),
  notes: z.string().max(1000).trim().optional().nullable(),
});

/** Schema para actualizar un proveedor */
export const updateProveedorSchema = createProveedorSchema.partial().extend({
  isActive: z.boolean().optional(),
});

/** Schema para filtros de listado */
export const filterProveedorSchema = z.object({
  search: z.string().optional(),
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

export type CreateProveedorDto = z.infer<typeof createProveedorSchema>;
export type UpdateProveedorDto = z.infer<typeof updateProveedorSchema>;
export type FilterProveedorDto = z.infer<typeof filterProveedorSchema>;

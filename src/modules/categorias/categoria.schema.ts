import { z } from "zod";

/** Schema para crear una categoria */
export const createCategoriaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede tener mas de 100 caracteres")
    .trim(),
  description: z
    .string()
    .max(500, "La descripcion no puede tener mas de 500 caracteres")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido (ej: #1677ff)")
    .optional()
    .default("#1677ff"),
});

/** Schema para actualizar una categoria */
export const updateCategoriaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100)
    .trim()
    .optional(),
  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

/** Schema para filtros de listado */
export const filterCategoriaSchema = z.object({
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

export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDto = z.infer<typeof updateCategoriaSchema>;
export type FilterCategoriaDto = z.infer<typeof filterCategoriaSchema>;

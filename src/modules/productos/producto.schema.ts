import { z } from "zod";

/** Unidades de medida disponibles */
export const UNIDADES = ["Unidad", "Docena", "Caja", "Kg", "Litro", "Metro", "Par"] as const;

/** Schema para crear un producto */
export const createProductoSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede tener mas de 200 caracteres")
    .trim(),
  sku: z
    .string()
    .max(50, "El SKU no puede tener mas de 50 caracteres")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "La descripcion no puede tener mas de 1000 caracteres")
    .trim()
    .optional(),
  price: z
    .number({ required_error: "El precio es requerido" })
    .nonnegative("El precio no puede ser negativo")
    .max(9999999.99, "Precio fuera de rango"),
  cost: z
    .number()
    .nonnegative("El costo no puede ser negativo")
    .optional()
    .default(0),
  stock: z
    .number()
    .nonnegative("El stock no puede ser negativo")
    .optional()
    .default(0),
  minStock: z
    .number()
    .nonnegative("El stock minimo no puede ser negativo")
    .optional()
    .default(0),
  unit: z
    .string()
    .optional()
    .default("Unidad"),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  barcode: z.string().max(50).trim().optional().nullable(),
  image: z.string().url("URL de imagen invalida").optional().nullable(),
  taxRate: z.number().min(0).max(1).optional().default(0.13),
  maxStock: z.number().nonnegative().optional().nullable(),
  trackStock: z.boolean().optional().default(true),
});

/** Schema para actualizar un producto */
export const updateProductoSchema = createProductoSchema.partial().extend({
  isActive: z.boolean().optional(),
});

/** Schema para filtros de listado */
export const filterProductoSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z
    .string()
    .transform((v) => v === "true" ? true : v === "false" ? false : undefined)
    .optional(),
  lowStock: z
    .string()
    .transform((v) => v === "true")
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

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
export type FilterProductoDto = z.infer<typeof filterProductoSchema>;

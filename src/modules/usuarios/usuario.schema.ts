import { z } from "zod";

/** Roles disponibles en formularios de usuario */
export const USER_ROLES = ["ADMIN", "MANAGER", "SELLER", "ACCOUNTANT", "VIEWER"] as const;

/** Schema para crear un usuario */
export const createUsuarioSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede tener mas de 200 caracteres")
    .trim(),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email invalido")
    .toLowerCase()
    .trim(),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "Rol invalido" }),
  }),
});

/** Schema para actualizar un usuario */
export const updateUsuarioSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email("Email invalido").toLowerCase().trim().optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url("URL de avatar invalida").optional().nullable(),
});

/** Schema para filtros de listado */
export const filterUsuarioSchema = z.object({
  search: z.string().optional(),
  role: z.enum([...USER_ROLES, "SUPER_ADMIN"] as [string, ...string[]]).optional(),
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

export type CreateUsuarioDto = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioDto = z.infer<typeof updateUsuarioSchema>;
export type FilterUsuarioDto = z.infer<typeof filterUsuarioSchema>;

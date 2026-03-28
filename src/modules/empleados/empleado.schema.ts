import { z } from "zod";

/** Tipos de contrato disponibles */
export const TIPOS_CONTRATO = ["INDEFINIDO", "PLAZO_FIJO", "TEMPORAL", "HONORARIOS"] as const;

/** Estados de empleado */
export const ESTADOS_EMPLEADO = ["ACTIVO", "INACTIVO", "LICENCIA", "SUSPENDIDO"] as const;

/** Tipos de AFP en El Salvador */
export const TIPOS_AFP = ["CRECER", "CONFÍA"] as const;

/** Generos */
export const GENEROS = ["M", "F"] as const;

/** Schema para crear un empleado */
export const createEmpleadoSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener mas de 100 caracteres")
    .trim(),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede tener mas de 100 caracteres")
    .trim(),
  dui: z.string().max(20).trim().optional().nullable(),
  nit: z.string().max(20).trim().optional().nullable(),
  nss: z.string().max(20).trim().optional().nullable(),
  nup: z.string().max(20).trim().optional().nullable(),
  email: z.string().email("Email invalido").optional().nullable(),
  phone: z.string().max(20).trim().optional().nullable(),
  address: z.string().max(500).trim().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(GENEROS).optional().nullable(),
  cargo: z
    .string()
    .min(1, "El cargo es requerido")
    .max(100, "El cargo no puede tener mas de 100 caracteres")
    .trim(),
  departamento: z.string().max(100).trim().optional().nullable(),
  fechaIngreso: z.string().min(1, "La fecha de ingreso es requerida"),
  tipoContrato: z.enum(TIPOS_CONTRATO).default("INDEFINIDO"),
  salarioBase: z
    .number({ invalid_type_error: "El salario debe ser un numero" })
    .positive("El salario debe ser mayor a 0"),
  tipoAFP: z.enum(TIPOS_AFP).default("CONFÍA"),
  exentoISS: z.boolean().optional().default(false),
  exentoAFP: z.boolean().optional().default(false),
  exentoRenta: z.boolean().optional().default(false),
  notes: z.string().max(1000).trim().optional().nullable(),
});

/** Schema para actualizar un empleado */
export const updateEmpleadoSchema = createEmpleadoSchema.partial().extend({
  estado: z.enum(ESTADOS_EMPLEADO).optional(),
  isActive: z.boolean().optional(),
});

/** Schema para filtros de listado */
export const filterEmpleadoSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(ESTADOS_EMPLEADO).optional(),
  departamento: z.string().optional(),
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

export type CreateEmpleadoDto = z.infer<typeof createEmpleadoSchema>;
export type UpdateEmpleadoDto = z.infer<typeof updateEmpleadoSchema>;
export type FilterEmpleadoDto = z.infer<typeof filterEmpleadoSchema>;

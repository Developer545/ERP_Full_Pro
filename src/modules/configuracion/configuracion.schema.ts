import { z } from "zod";

/** Schema para datos DTE de El Salvador */
export const dteConfigSchema = z.object({
  nit: z.string().max(20).trim().optional().nullable(),
  nrc: z.string().max(20).trim().optional().nullable(),
  actividadEconomica: z.string().max(200).trim().optional().nullable(),
  codActividad: z.string().max(10).trim().optional().nullable(),
  direccionFiscal: z.string().max(500).trim().optional().nullable(),
  usuarioMH: z.string().max(100).trim().optional().nullable(),
  ambiente: z.enum(["00", "01"]).optional().default("00"),
});

/** Schema para actualizar la configuracion del tenant */
export const updateConfiguracionSchema = z.object({
  // Tab Empresa
  name: z
    .string()
    .min(1, "El nombre de la empresa es requerido")
    .max(200)
    .trim()
    .optional(),
  email: z.string().email("Email invalido").optional().nullable(),
  phone: z.string().max(20).trim().optional().nullable(),
  address: z.string().max(500).trim().optional().nullable(),
  logo: z.string().url("URL de logo invalida").optional().nullable(),
  // Tab DTE
  dte: dteConfigSchema.optional(),
});

export type UpdateConfiguracionDto = z.infer<typeof updateConfiguracionSchema>;
export type DTEConfigDto = z.infer<typeof dteConfigSchema>;

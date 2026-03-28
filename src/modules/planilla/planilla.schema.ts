import { z } from "zod";

// ─── Ajuste por empleado ──────────────────────────────────────────────────────

export const ajusteEmpleadoSchema = z.object({
  employeeId: z.string(),
  horasExtra:      z.number().min(0).optional().default(0),
  bonos:           z.number().min(0).optional().default(0),
  comisiones:      z.number().min(0).optional().default(0),
  otrosIngresos:   z.number().min(0).optional().default(0),
  otrasDeduciones: z.number().min(0).optional().default(0),
});

// ─── Generar planilla ─────────────────────────────────────────────────────────

export const generarPlanillaSchema = z.object({
  mes:  z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2099),
  ajustes: z.array(ajusteEmpleadoSchema).optional().default([]),
});

export type GenerarPlanillaDto = z.infer<typeof generarPlanillaSchema>;

// ─── Cerrar planilla ──────────────────────────────────────────────────────────

export const cerrarPlanillaSchema = z.object({
  id: z.string().cuid("ID de planilla invalido"),
});

export type CerrarPlanillaDto = z.infer<typeof cerrarPlanillaSchema>;

// ─── Filtros para listar planillas ────────────────────────────────────────────

export const filtroPlanillaSchema = z.object({
  mes:      z.coerce.number().int().min(1).max(12).optional(),
  anio:     z.coerce.number().int().min(2020).max(2099).optional(),
  estado:   z.enum(["BORRADOR", "CERRADA", "PAGADA"]).optional(),
  page:     z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type FiltroPlanillaDto = z.infer<typeof filtroPlanillaSchema>;

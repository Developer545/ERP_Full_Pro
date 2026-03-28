// ─── Tipos del modulo de Planilla SV ────────────────────────────────────────

/**
 * Fila de Planilla con totales del periodo.
 */
export interface PlanillaRow {
  id: string;
  tenantId: string;
  periodo: string;
  mes: number;
  anio: number;
  estado: "BORRADOR" | "CERRADA" | "PAGADA";
  empleadosCount: number;
  totalBruto: number;
  totalISS: number;
  totalAFP: number;
  totalRenta: number;
  totalDescuentos: number;
  totalNeto: number;
  totalISSPatronal: number;
  totalAFPPatronal: number;
  totalINSAFORP: number;
  createdAt: string;
  detalles?: PlanillaDetalleRow[];
}

/**
 * Fila de detalle por empleado dentro de una planilla.
 */
export interface PlanillaDetalleRow {
  id: string;
  planillaId: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    cargo: string;
    dui?: string | null;
  };
  salarioBase: number;
  diasTrabajados: number;
  horasExtra: number;
  bonos: number;
  comisiones: number;
  otrosIngresos: number;
  totalBruto: number;
  descuentoISS: number;
  descuentoAFP: number;
  descuentoRenta: number;
  otrasDeduciones: number;
  totalDescuentos: number;
  salarioNeto: number;
  issPatronal: number;
  afpPatronal: number;
  insaforp: number;
}

/**
 * Resultado de calculos para un empleado — usado internamente.
 * Equivalente a PlanillaDetalleCalc del spec.
 */
export interface PlanillaDetalleCalc {
  empleadoId: string;
  nombreCompleto: string;
  cargo: string;
  salarioBase: number;
  // Devengos
  horasExtra: number;
  montoHorasExtra: number;
  otrosDevengos: number;
  totalDevengado: number;
  // Descuentos empleado
  isssEmpleado: number;
  afpEmpleado: number;
  isr: number;
  otrosDescuentos: number;
  totalDescuentos: number;
  // Liquido
  liquidoPagar: number;
  // Costo patronal
  isssPatronal: number;
  afpPatronal: number;
  insaforp: number;
  costoPatronal: number;
}

/**
 * Ajuste opcional por empleado al generar planilla.
 */
export interface AjusteEmpleado {
  employeeId: string;
  horasExtra?: number;
  bonos?: number;
  comisiones?: number;
  otrosIngresos?: number;
  otrasDeduciones?: number;
}

/**
 * Input para generar una planilla.
 */
export interface GenerarPlanillaInput {
  mes: number; // 1-12
  anio: number;
  empleadoIds?: string[]; // si vacio, todos los activos
  ajustes?: AjusteEmpleado[];
}

/**
 * Filtros para listar planillas.
 */
export interface FiltroPlanilla {
  mes?: number;
  anio?: number;
  estado?: "BORRADOR" | "CERRADA" | "PAGADA";
  page?: number;
  pageSize?: number;
}

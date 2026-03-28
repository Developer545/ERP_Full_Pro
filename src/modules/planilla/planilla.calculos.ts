/**
 * Calculos de Planilla SV — tablas oficiales El Salvador 2024
 *
 * ISSS empleado:   3%   del bruto, tope sobre $1,000 → max $30/mes
 * AFP empleado:    7.25% del bruto, sin tope
 * ISSS patronal:   7.5%  del bruto, tope sobre $1,000 → max $75/mes
 * AFP patronal:    8.75% del bruto, sin tope
 * INSAFORP:        1%   del bruto, sin tope
 *
 * ISR mensual (tabla progresiva DGII SV 2024):
 *   Hasta $487.00             → exento (0%)
 *   $487.01 – $913.33         → 10% sobre excedente de $487.00
 *   $913.34 – $2,166.67       → $42.63  + 20% sobre excedente de $913.33
 *   $2,166.68 – $4,333.33     → $293.36 + 25% sobre excedente de $2,166.67
 *   Mas de $4,333.34          → $834.43 + 30% sobre excedente de $4,333.33
 */

// ─── Deducciones empleado ─────────────────────────────────────────────────────

/** ISSS empleado: 3% del bruto con tope en $1,000 de base → max $30/mes */
export function calcularISS(salarioBruto: number, exento = false): number {
  if (exento) return 0;
  const base = Math.min(salarioBruto, 1000);
  return Math.round(base * 0.03 * 100) / 100;
}

/**
 * AFP empleado: 7.25% sin tope.
 * Ambas AFP (CRECER y CONFIA) tienen el mismo porcentaje de empleado.
 */
export function calcularAFP(
  salarioBruto: number,
  _tipo: "CRECER" | "CONFIA" = "CONFIA",
  exento = false
): number {
  if (exento) return 0;
  return Math.round(salarioBruto * 0.0725 * 100) / 100;
}

/** @deprecated Usar calcularAFP */
export function calcularAFPEmpleado(salarioBruto: number, exento = false): number {
  return calcularAFP(salarioBruto, "CONFIA", exento);
}

/**
 * ISR mensual — tabla progresiva El Salvador 2024.
 * Base imponible = bruto - ISSS empleado - AFP empleado.
 */
export function calcularISR(baseImponible: number, exento = false): number {
  if (exento || baseImponible <= 487.0) return 0;
  if (baseImponible <= 913.33) {
    return Math.round((baseImponible - 487.0) * 0.1 * 100) / 100;
  }
  if (baseImponible <= 2166.67) {
    return Math.round((42.63 + (baseImponible - 913.33) * 0.2) * 100) / 100;
  }
  if (baseImponible <= 4333.33) {
    return Math.round((293.36 + (baseImponible - 2166.67) * 0.25) * 100) / 100;
  }
  return Math.round((834.43 + (baseImponible - 4333.33) * 0.3) * 100) / 100;
}

/** @deprecated Usar calcularISR */
export function calcularRenta(baseImponible: number, exento = false): number {
  return calcularISR(baseImponible, exento);
}

// ─── Aporte patronal ──────────────────────────────────────────────────────────

/** ISSS patronal: 7.5% del bruto con tope en $1,000 → max $75/mes */
export function calcularISSPatronal(salarioBruto: number): number {
  const base = Math.min(salarioBruto, 1000);
  return Math.round(base * 0.075 * 100) / 100;
}

/** AFP patronal: 8.75% sin tope */
export function calcularAFPPatronal(salarioBruto: number, exento = false): number {
  if (exento) return 0;
  return Math.round(salarioBruto * 0.0875 * 100) / 100;
}

/** INSAFORP patronal: 1% sin tope */
export function calcularINSAFORP(salarioBruto: number): number {
  return Math.round(salarioBruto * 0.01 * 100) / 100;
}

// ─── Calculo completo por empleado ───────────────────────────────────────────

export interface CalcDetalleParams {
  salarioBase: number;
  diasTrabajados: number; // default 30
  horasExtra: number;
  bonos: number;
  comisiones: number;
  otrosIngresos: number;
  otrasDeduciones: number;
  exentoISS: boolean;
  exentoAFP: boolean;
  exentoRenta: boolean;
}

export interface CalcDetalleResult {
  totalBruto: number;
  descuentoISS: number;
  descuentoAFP: number;
  descuentoRenta: number;
  totalDescuentos: number;
  salarioNeto: number;
  issPatronal: number;
  afpPatronal: number;
  insaforp: number;
}

/**
 * Calcula todos los devengos, deducciones y costo patronal de un empleado
 * para un periodo mensual.
 *
 * Flujo:
 *   1. Salario proporcional = salarioBase / 30 * diasTrabajados
 *   2. Total bruto = proporcional + horasExtra + bonos + comisiones + otrosIngresos
 *   3. ISSS = 3% (tope $1,000)
 *   4. AFP  = 7.25%
 *   5. Base ISR = bruto - ISSS - AFP
 *   6. ISR  = tabla progresiva
 *   7. Total descuentos = ISSS + AFP + ISR + otrasDeduciones
 *   8. Neto = bruto - descuentos
 *   9. Patronal: ISSS 7.5% + AFP 8.75% + INSAFORP 1%
 */
export function calcularDetalleEmpleado(p: CalcDetalleParams): CalcDetalleResult {
  const salarioDia = p.salarioBase / 30;
  const salarioProporcional = Math.round(salarioDia * p.diasTrabajados * 100) / 100;
  const totalBruto = Math.round(
    (salarioProporcional + p.horasExtra + p.bonos + p.comisiones + p.otrosIngresos) * 100
  ) / 100;

  const descuentoISS = calcularISS(totalBruto, p.exentoISS);
  const descuentoAFP = calcularAFP(totalBruto, "CONFIA", p.exentoAFP);
  const baseISR = Math.max(0, totalBruto - descuentoISS - descuentoAFP);
  const descuentoRenta = calcularISR(baseISR, p.exentoRenta);

  const totalDescuentos = Math.round(
    (descuentoISS + descuentoAFP + descuentoRenta + p.otrasDeduciones) * 100
  ) / 100;
  const salarioNeto = Math.round((totalBruto - totalDescuentos) * 100) / 100;

  const issPatronal = calcularISSPatronal(totalBruto);
  const afpPatronal = calcularAFPPatronal(totalBruto, p.exentoAFP);
  const insaforp = calcularINSAFORP(totalBruto);

  return {
    totalBruto,
    descuentoISS,
    descuentoAFP,
    descuentoRenta,
    totalDescuentos,
    salarioNeto,
    issPatronal,
    afpPatronal,
    insaforp,
  };
}

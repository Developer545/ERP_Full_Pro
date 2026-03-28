/**
 * Calculos de Aguinaldo segun el Codigo de Trabajo de El Salvador.
 *
 * Articulo 196: El aguinaldo se paga en la segunda quincena de diciembre.
 * La cantidad de dias depende de los años de servicio continuo:
 *   - 1 año a menos de 3 años  → 15 dias de salario
 *   - 3 años a menos de 10 años → 19 dias de salario
 *   - 10 años o mas             → 21 dias de salario
 *
 * Formula: salarioMensual / 30 * diasAguinaldo
 */

/**
 * Retorna la cantidad de dias de aguinaldo segun los anios de servicio.
 * Si el empleado tiene menos de 1 anio, retorna 0 (no aplica).
 */
export function diasAguinaldo(aniosServicio: number): number {
  if (aniosServicio < 1) return 0;
  if (aniosServicio < 3) return 15;
  if (aniosServicio < 10) return 19;
  return 21;
}

/**
 * Calcula el monto de aguinaldo.
 *
 * @param salarioMensual - Salario base mensual en USD
 * @param aniosServicio  - Anios completos de servicio (se usa la parte entera)
 * @returns Monto del aguinaldo en USD, redondeado a 2 decimales
 */
export function calcularAguinaldo(
  salarioMensual: number,
  aniosServicio: number
): number {
  const dias = diasAguinaldo(aniosServicio);
  if (dias === 0) return 0;
  const monto = (salarioMensual / 30) * dias;
  return Math.round(monto * 100) / 100;
}

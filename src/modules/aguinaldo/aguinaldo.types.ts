/**
 * Tipos TypeScript para el modulo de Aguinaldo.
 */

export interface AguinaldoEmpleado {
  empleadoId: string;
  nombre: string;       // firstName + lastName
  cargo: string;
  salarioBase: number;
  fechaIngreso: Date;
  aniosServicio: number;
  diasAguinaldo: number;
  montoAguinaldo: number;
}

export interface AguinaldoResult {
  empleados: AguinaldoEmpleado[];
  total: number;
  anio: number;
}

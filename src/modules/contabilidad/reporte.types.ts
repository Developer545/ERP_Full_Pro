export interface FiltroPeriodoOFecha {
  periodoId?: string;
  desde?: string;
  hasta?: string;
}

export interface FiltroLibroMayor extends FiltroPeriodoOFecha {
  accountId: string;
}

export interface LineaBalanceComprobacion {
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
  debitos: number;
  creditos: number;
  saldoDeudor: number;
  saldoAcreedor: number;
}

export interface MovimientoMayor {
  fecha: string;
  numero: number;
  concepto: string;
  descripcion: string | null;
  debe: number;
  haber: number;
  saldoAcumulado: number;
}

export interface LibroMayorResult {
  cuenta: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    naturaleza: string;
  };
  saldoAnterior: number;
  movimientos: MovimientoMayor[];
  totalDebe: number;
  totalHaber: number;
  saldoFinal: number;
}

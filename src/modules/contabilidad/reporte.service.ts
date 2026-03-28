import { ReporteRepository } from "./reporte.repository";
import type { FiltroPeriodoOFecha, FiltroLibroMayor } from "./reporte.types";

export const ReporteService = {
  async balanceComprobacion(filtros: FiltroPeriodoOFecha) {
    const lineas = await ReporteRepository.balanceComprobacion(filtros);

    const totalDebitos = lineas.reduce((s, l) => s + l.debitos, 0);
    const totalCreditos = lineas.reduce((s, l) => s + l.creditos, 0);
    const totalSaldoDeudor = lineas.reduce((s, l) => s + l.saldoDeudor, 0);
    const totalSaldoAcreedor = lineas.reduce((s, l) => s + l.saldoAcreedor, 0);
    const cuadra = Math.abs(totalDebitos - totalCreditos) < 0.01;

    return {
      lineas,
      totales: { totalDebitos, totalCreditos, totalSaldoDeudor, totalSaldoAcreedor },
      cuadra,
    };
  },

  async libroMayor(filtros: FiltroLibroMayor) {
    if (!filtros.accountId) {
      throw new Error("Debe especificar una cuenta");
    }
    return ReporteRepository.libroMayor(filtros);
  },
};

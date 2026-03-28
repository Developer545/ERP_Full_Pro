import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { calcularAguinaldo, diasAguinaldo } from "./aguinaldo.calculos";
import type { AguinaldoEmpleado, AguinaldoResult } from "./aguinaldo.types";

/**
 * Calcula el aguinaldo para todos los empleados activos del tenant actual.
 * Se usa el año en curso (o el proporcionado) como referencia para calcular
 * los anios de servicio.
 */
export const AguinaldoService = {
  /**
   * Obtiene el calculo de aguinaldo para cada empleado activo.
   * Solo incluye empleados con al menos 1 anio de servicio.
   */
  async calcularAguinaldoTenant(anioReferencia?: number): Promise<AguinaldoResult> {
    const tenantId = getCurrentTenantId();
    const anio = anioReferencia ?? new Date().getFullYear();
    // Fecha de corte: 12 de diciembre del año de referencia
    const fechaCorte = new Date(anio, 11, 12); // diciembre = mes 11 (0-indexed)

    const empleados = await prisma.employee.findMany({
      where: {
        tenantId,
        isActive: true,
        estado: "ACTIVO",
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        cargo: true,
        salarioBase: true,
        fechaIngreso: true,
      },
      orderBy: { firstName: "asc" },
    });

    const resultado: AguinaldoEmpleado[] = [];

    for (const emp of empleados) {
      // Calcular anios completos de servicio al 12 de diciembre
      const inicio = new Date(emp.fechaIngreso);
      let aniosServicio =
        fechaCorte.getFullYear() - inicio.getFullYear();

      // Ajustar si aun no ha llegado el aniversario en ese año
      const aniversarioEsteAnio = new Date(
        fechaCorte.getFullYear(),
        inicio.getMonth(),
        inicio.getDate()
      );
      if (fechaCorte < aniversarioEsteAnio) {
        aniosServicio -= 1;
      }

      if (aniosServicio < 1) continue; // No aplica aguinaldo

      const salario = Number(emp.salarioBase);
      const dias = diasAguinaldo(aniosServicio);
      const monto = calcularAguinaldo(salario, aniosServicio);

      resultado.push({
        empleadoId: emp.id,
        nombre: `${emp.firstName} ${emp.lastName}`,
        cargo: emp.cargo,
        salarioBase: salario,
        fechaIngreso: emp.fechaIngreso,
        aniosServicio,
        diasAguinaldo: dias,
        montoAguinaldo: monto,
      });
    }

    const total = getTotalAguinaldo(resultado);

    return { empleados: resultado, total, anio };
  },
};

/**
 * Suma el monto total de aguinaldo de un array de empleados.
 */
export function getTotalAguinaldo(empleados: AguinaldoEmpleado[]): number {
  const suma = empleados.reduce((acc, e) => acc + e.montoAguinaldo, 0);
  return Math.round(suma * 100) / 100;
}

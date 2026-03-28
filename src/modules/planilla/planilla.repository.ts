import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import { AppError } from "@/lib/errors/app-error";
import { calcularDetalleEmpleado } from "./planilla.calculos";
import type { GenerarPlanillaDto, FiltroPlanillaDto } from "./planilla.schema";

/** Include para detalle completo de planilla con empleados */
const PLANILLA_DETALLE_INCLUDE = {
  detalles: {
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          cargo: true,
          dui: true,
        },
      },
    },
    orderBy: { employee: { lastName: "asc" } },
  },
} as const;

/**
 * Repositorio de Planilla — solo queries Prisma, sin logica de negocio.
 */
export const PlanillaRepository = {
  /**
   * Lista planillas del tenant con filtros opcionales.
   */
  async findAll(filtros: Partial<FiltroPlanillaDto> = {}) {
    const tenantId = getCurrentTenantId();
    const { mes, anio, estado, page = 1, pageSize = 20 } = filtros;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      isActive: true,
      ...(mes && { mes }),
      ...(anio && { anio }),
      ...(estado && { estado: estado as import("@prisma/client").EstadoPlanilla }),
    };

    const [items, total] = await Promise.all([
      prisma.planilla.findMany({
        where,
        orderBy: [{ anio: "desc" }, { mes: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.planilla.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  /**
   * Planilla por ID con todos los detalles de empleados.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.planilla.findFirst({
      where: { id, tenantId, isActive: true },
      include: PLANILLA_DETALLE_INCLUDE,
    });
  },

  /**
   * Verifica si existe una planilla para el periodo dado (mes/anio).
   */
  async exists(mes: number, anio: number): Promise<boolean> {
    const tenantId = getCurrentTenantId();
    const periodo = `${anio}-${String(mes).padStart(2, "0")}`;
    const found = await prisma.planilla.findFirst({
      where: { tenantId, periodo, isActive: true },
      select: { id: true },
    });
    return !!found;
  },

  /**
   * Genera una planilla nueva para el periodo indicado.
   * Transaccion atomica:
   *   1. Verifica que no exista planilla para ese periodo
   *   2. Obtiene todos los empleados activos del tenant
   *   3. Calcula los detalles de cada empleado aplicando ajustes opcionales
   *   4. Crea la Planilla con totales sumados
   *   5. Crea los PlanillaDetalle en bulk
   *   6. Retorna la planilla con detalles
   */
  async generar(input: GenerarPlanillaDto, userId?: string) {
    const tenantId = getCurrentTenantId();
    const periodo = `${input.anio}-${String(input.mes).padStart(2, "0")}`;

    return prisma.$transaction(async (tx) => {
      // 1. Verificar que no exista planilla para ese periodo
      const existente = await tx.planilla.findFirst({
        where: { tenantId, periodo, isActive: true },
        select: { id: true },
      });

      if (existente) {
        throw new AppError(
          "PLANILLA_YA_EXISTE",
          `Ya existe una planilla para el periodo ${periodo}`,
          409
        );
      }

      // 2. Obtener todos los empleados activos
      const empleados = await tx.employee.findMany({
        where: { tenantId, isActive: true, estado: "ACTIVO" },
      });

      if (empleados.length === 0) {
        throw new AppError(
          "SIN_EMPLEADOS",
          "No hay empleados activos para generar la planilla",
          422
        );
      }

      // 3. Calcular detalle por empleado
      type DetalleCalculado = {
        employeeId: string;
        salarioBase: number;
        diasTrabajados: number;
        horasExtra: number;
        bonos: number;
        comisiones: number;
        otrosIngresos: number;
        otrasDeduciones: number;
        totalBruto: number;
        descuentoISS: number;
        descuentoAFP: number;
        descuentoRenta: number;
        totalDescuentos: number;
        salarioNeto: number;
        issPatronal: number;
        afpPatronal: number;
        insaforp: number;
      };

      const detallesCalculados: DetalleCalculado[] = empleados.map((emp) => {
        const ajuste = input.ajustes?.find((a) => a.employeeId === emp.id);

        const params = {
          salarioBase:     Number(emp.salarioBase),
          diasTrabajados:  30,
          horasExtra:      ajuste?.horasExtra ?? 0,
          bonos:           ajuste?.bonos ?? 0,
          comisiones:      ajuste?.comisiones ?? 0,
          otrosIngresos:   ajuste?.otrosIngresos ?? 0,
          otrasDeduciones: ajuste?.otrasDeduciones ?? 0,
          exentoISS:       emp.exentoISS,
          exentoAFP:       emp.exentoAFP,
          exentoRenta:     emp.exentoRenta,
        };

        const calc = calcularDetalleEmpleado(params);

        return {
          employeeId:      emp.id,
          salarioBase:     Number(emp.salarioBase),
          diasTrabajados:  30,
          horasExtra:      params.horasExtra,
          bonos:           params.bonos,
          comisiones:      params.comisiones,
          otrosIngresos:   params.otrosIngresos,
          otrasDeduciones: params.otrasDeduciones,
          ...calc,
        };
      });

      // 4. Sumar totales de todos los empleados
      let sumBruto = 0, sumISS = 0, sumAFP = 0, sumRenta = 0;
      let sumDescuentos = 0, sumNeto = 0;
      let sumISSPatronal = 0, sumAFPPatronal = 0, sumINSAFORP = 0;

      for (const d of detallesCalculados) {
        sumBruto       += d.totalBruto;
        sumISS         += d.descuentoISS;
        sumAFP         += d.descuentoAFP;
        sumRenta       += d.descuentoRenta;
        sumDescuentos  += d.totalDescuentos;
        sumNeto        += d.salarioNeto;
        sumISSPatronal += d.issPatronal;
        sumAFPPatronal += d.afpPatronal;
        sumINSAFORP    += d.insaforp;
      }

      // 5. Crear la Planilla
      const planilla = await tx.planilla.create({
        data: {
          tenantId,
          periodo,
          mes:             input.mes,
          anio:            input.anio,
          estado:          "BORRADOR",
          empleadosCount:  detallesCalculados.length,
          totalBruto:      Math.round(sumBruto       * 100) / 100,
          totalISS:        Math.round(sumISS         * 100) / 100,
          totalAFP:        Math.round(sumAFP         * 100) / 100,
          totalRenta:      Math.round(sumRenta       * 100) / 100,
          totalDescuentos: Math.round(sumDescuentos  * 100) / 100,
          totalNeto:       Math.round(sumNeto        * 100) / 100,
          totalISSPatronal:Math.round(sumISSPatronal * 100) / 100,
          totalAFPPatronal:Math.round(sumAFPPatronal * 100) / 100,
          totalINSAFORP:   Math.round(sumINSAFORP    * 100) / 100,
          isActive:        true,
          ...(userId ? { createdBy: userId } : {}),
        },
      });

      // 6. Crear detalles en bulk
      await tx.planillaDetalle.createMany({
        data: detallesCalculados.map((d) => ({
          planillaId:      planilla.id,
          employeeId:      d.employeeId,
          salarioBase:     d.salarioBase,
          diasTrabajados:  d.diasTrabajados,
          horasExtra:      d.horasExtra,
          bonos:           d.bonos,
          comisiones:      d.comisiones,
          otrosIngresos:   d.otrosIngresos,
          totalBruto:      d.totalBruto,
          descuentoISS:    d.descuentoISS,
          descuentoAFP:    d.descuentoAFP,
          descuentoRenta:  d.descuentoRenta,
          otrasDeduciones: d.otrasDeduciones,
          totalDescuentos: d.totalDescuentos,
          salarioNeto:     d.salarioNeto,
          issPatronal:     d.issPatronal,
          afpPatronal:     d.afpPatronal,
          insaforp:        d.insaforp,
        })),
      });

      // 7. Retornar planilla con detalles
      return tx.planilla.findUnique({
        where: { id: planilla.id },
        include: PLANILLA_DETALLE_INCLUDE,
      });
    });
  },

  /**
   * Cierra una planilla (estado BORRADOR → CERRADA).
   */
  async cerrar(id: string, userId?: string) {
    const tenantId = getCurrentTenantId();
    return prisma.planilla.update({
      where: { id, tenantId },
      data: {
        estado: "CERRADA",
        ...(userId ? { updatedBy: userId } : {}),
      },
    });
  },

  /**
   * Soft delete de una planilla. Solo aplica en estado BORRADOR.
   */
  async softDelete(id: string, userId?: string) {
    const tenantId = getCurrentTenantId();

    const planilla = await prisma.planilla.findFirst({
      where: { id, tenantId, isActive: true },
      select: { id: true, estado: true },
    });

    if (!planilla) {
      throw new AppError("PLANILLA_NOT_FOUND", "Planilla no encontrada", 404);
    }

    if (planilla.estado !== "BORRADOR") {
      throw new AppError(
        "PLANILLA_NO_ELIMINABLE",
        "Solo se pueden eliminar planillas en estado Borrador",
        422
      );
    }

    return prisma.planilla.update({
      where: { id, tenantId },
      data: {
        isActive: false,
        ...(userId ? { updatedBy: userId } : {}),
      },
    });
  },
};

// Re-export for convenience
export { getCurrentUserId };

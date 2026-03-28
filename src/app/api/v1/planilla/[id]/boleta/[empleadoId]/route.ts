import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { prisma } from "@/lib/prisma/client";
import { BoletaPDF } from "@/lib/export/boleta-pdf";
import type { BoletaPDFData } from "@/lib/export/boleta-pdf";

/**
 * GET /api/v1/planilla/[id]/boleta/[empleadoId]
 * Genera y descarga la boleta de pago en PDF para un empleado en una planilla.
 */
export const GET = withApi(async (_req, { tenant, params }) => {
  try {
    const { id: planillaId, empleadoId } = params;

    // 1. Buscar el detalle de planilla para ese empleado
    const detalle = await prisma.planillaDetalle.findFirst({
      where: { planillaId, employeeId: empleadoId },
      include: {
        employee: true,
        planilla: true,
      },
    });

    if (!detalle) {
      throw new AppError(
        ErrorCodes.NOT_FOUND,
        "No se encontro detalle de planilla para este empleado",
        404
      );
    }

    // 2. Datos del empleado
    const emp = detalle.employee;
    const planilla = detalle.planilla;

    // Formatear fecha ingreso DD/MM/YYYY
    const fi = emp.fechaIngreso;
    const fechaIngreso = `${String(fi.getDate()).padStart(2, "0")}/${String(fi.getMonth() + 1).padStart(2, "0")}/${fi.getFullYear()}`;

    // 3. Armar datos para el PDF
    const boletaData: BoletaPDFData = {
      empresaNombre: tenant.name,
      mes: planilla.mes,
      anio: planilla.anio,
      empleadoNombre: `${emp.firstName} ${emp.lastName}`,
      dui: emp.dui,
      cargo: emp.cargo,
      fechaIngreso,
      salarioBase: Number(detalle.salarioBase),
      horasExtra: Number(detalle.horasExtra),
      bonos: Number(detalle.bonos),
      comisiones: Number(detalle.comisiones),
      otrosIngresos: Number(detalle.otrosIngresos),
      totalBruto: Number(detalle.totalBruto),
      descuentoISS: Number(detalle.descuentoISS),
      descuentoAFP: Number(detalle.descuentoAFP),
      descuentoRenta: Number(detalle.descuentoRenta),
      otrasDeduciones: Number(detalle.otrasDeduciones),
      totalDescuentos: Number(detalle.totalDescuentos),
      salarioNeto: Number(detalle.salarioNeto),
    };

    // 4. Generar PDF
    const element = createElement(BoletaPDF, { data: boletaData }) as unknown as import("react").ReactElement<import("@react-pdf/renderer").DocumentProps>;
    const buffer = await renderToBuffer(element);

    // 5. Nombre de archivo: boleta-apellido-YYYY-MM.pdf
    const apellido = emp.lastName.toLowerCase().replace(/\s+/g, "-");
    const filename = `boleta-${apellido}-${planilla.anio}-${String(planilla.mes).padStart(2, "0")}.pdf`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

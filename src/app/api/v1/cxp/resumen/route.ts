import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxPService } from "@/modules/cxp/cxp.service";

/**
 * GET /api/v1/cxp/resumen
 * Totales de CxP: pendiente, vencido, pagado este mes, cantidad proximas a vencer.
 * Usado para los KPI cards del modulo.
 */
export const GET = withApi(async () => {
  try {
    const resumen = await CxPService.getResumen();
    return NextResponse.json({ data: resumen });
  } catch (error) {
    return handleApiError(error);
  }
});

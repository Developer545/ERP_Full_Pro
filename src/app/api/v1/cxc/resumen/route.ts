import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxCService } from "@/modules/cxc/cxc.service";

/**
 * GET /api/v1/cxc/resumen
 * Totales de CxC por estado: pendiente, vencido, cobrado este mes.
 * Usado para los KPI cards del modulo.
 */
export const GET = withApi(async () => {
  try {
    const resumen = await CxCService.getResumen();
    return NextResponse.json({ data: resumen });
  } catch (error) {
    return handleApiError(error);
  }
});

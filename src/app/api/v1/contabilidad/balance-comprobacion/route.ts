import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ReporteService } from "@/modules/contabilidad/reporte.service";

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const filtros = {
      periodoId: url.searchParams.get("periodoId") ?? undefined,
      desde: url.searchParams.get("desde") ?? undefined,
      hasta: url.searchParams.get("hasta") ?? undefined,
    };
    const resultado = await ReporteService.balanceComprobacion(filtros);
    return NextResponse.json({ data: resultado });
  } catch (error) {
    return handleApiError(error);
  }
});

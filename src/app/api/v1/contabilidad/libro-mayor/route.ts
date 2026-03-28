import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ReporteService } from "@/modules/contabilidad/reporte.service";
import { AppError } from "@/lib/errors/app-error";

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId");
    if (!accountId) {
      throw new AppError("PARAMETRO_REQUERIDO", "El parámetro accountId es requerido", 400);
    }
    const filtros = {
      accountId,
      periodoId: url.searchParams.get("periodoId") ?? undefined,
      desde: url.searchParams.get("desde") ?? undefined,
      hasta: url.searchParams.get("hasta") ?? undefined,
    };
    const resultado = await ReporteService.libroMayor(filtros);
    return NextResponse.json({ data: resultado });
  } catch (error) {
    return handleApiError(error);
  }
});

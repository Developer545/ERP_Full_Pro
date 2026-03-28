import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PeriodoService } from "@/modules/contabilidad/periodo.service";

export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = await params;
    const periodo = await PeriodoService.getById(id);
    return NextResponse.json({ data: periodo });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withApi(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const accion = body.accion as "cerrar" | "reabrir";
    if (accion === "cerrar") {
      const periodo = await PeriodoService.cerrar(id);
      return NextResponse.json({ data: periodo });
    }
    if (accion === "reabrir") {
      const periodo = await PeriodoService.reabrir(id);
      return NextResponse.json({ data: periodo });
    }
    return NextResponse.json({ error: { code: "ACCION_INVALIDA", message: "Acción no reconocida" } }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
});

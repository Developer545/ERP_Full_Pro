import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { TipoAsientoService } from "@/modules/contabilidad/tipo-asiento.service";

export const DELETE = withApi(async (_req, { params }) => {
  try {
    const { id } = await params;
    await TipoAsientoService.delete(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
});

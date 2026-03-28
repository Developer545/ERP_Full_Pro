import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AsientoService } from "@/modules/contabilidad/asiento.service";

export const POST = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const asiento = await AsientoService.publicar(id);
    return NextResponse.json({ data: asiento });
  } catch (error) {
    return handleApiError(error);
  }
});

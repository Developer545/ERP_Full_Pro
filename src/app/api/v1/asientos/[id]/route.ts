import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AsientoService } from "@/modules/contabilidad/asiento.service";
import { updateAsientoSchema } from "@/modules/contabilidad/asiento.schema";

export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const asiento = await AsientoService.getById(id);
    return NextResponse.json({ data: asiento });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withApi(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const data = updateAsientoSchema.parse(body);
    const asiento = await AsientoService.update(id, data);
    return NextResponse.json({ data: asiento });
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    await AsientoService.anular(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CuentaService } from "@/modules/contabilidad/cuenta.service";
import { updateCuentaSchema } from "@/modules/contabilidad/cuenta.schema";

export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const cuenta = await CuentaService.getById(id);
    return NextResponse.json({ data: cuenta });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withApi(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const data = updateCuentaSchema.parse(body);
    const cuenta = await CuentaService.update(id, data);
    return NextResponse.json({ data: cuenta });
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    await CuentaService.delete(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
});

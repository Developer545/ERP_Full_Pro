import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxPService } from "@/modules/cxp/cxp.service";

/**
 * GET /api/v1/cxp/[id]
 * Obtiene una cuenta por pagar por ID, incluyendo todos sus pagos.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const cxp = await CxPService.getById(id);
    return NextResponse.json({ data: cxp });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/cxp/[id]
 * Elimina (soft delete) una cuenta por pagar sin pagos.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    await CxPService.delete(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
});

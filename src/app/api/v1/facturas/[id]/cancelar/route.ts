import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { FacturaService } from "@/modules/facturas/factura.service";

/**
 * POST /api/v1/facturas/[id]/cancelar
 * Cancela una factura (soft — cambia status a CANCELLED).
 * Solo aplica a facturas en estado DRAFT o SENT.
 */
export const POST = withApi(async (_req, { params }) => {
  try {
    const factura = await FacturaService.cancel(params.id);
    return NextResponse.json({ data: factura });
  } catch (error) {
    return handleApiError(error);
  }
});

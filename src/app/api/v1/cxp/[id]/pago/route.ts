import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxPService } from "@/modules/cxp/cxp.service";
import { createPagoCxPSchema } from "@/modules/cxp/cxp.schema";

/**
 * POST /api/v1/cxp/[id]/pago
 * Registra un pago en una cuenta por pagar.
 * Actualiza montoPagado, montoPendiente y status automaticamente.
 */
export const POST = withApi(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const data = createPagoCxPSchema.parse(body);
    const cxp = await CxPService.registrarPago(id, data);
    return NextResponse.json({ data: cxp }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

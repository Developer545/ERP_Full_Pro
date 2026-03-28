import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxCService } from "@/modules/cxc/cxc.service";
import { createPagoSchema } from "@/modules/cxc/cxc.schema";

/**
 * POST /api/v1/cxc/[id]/pagos
 * Registra un pago en una cuenta por cobrar.
 * Actualiza paid, balance y status automaticamente segun el monto abonado.
 *
 * Body: { amount, paymentMethod, reference?, notes? }
 * Retorna: { data: cxcActualizada }
 */
export const POST = withApi(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const data = createPagoSchema.parse(body);
    const cxc = await CxCService.registrarPago(id, data);
    return NextResponse.json({ data: cxc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { FacturaService } from "@/modules/facturas/factura.service";
import { FacturaRepository } from "@/modules/facturas/factura.repository";
import { updateFacturaSchema } from "@/modules/facturas/factura.schema";

/**
 * GET /api/v1/facturas/[id]
 * Retorna una factura completa con items y datos del cliente.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const factura = await FacturaService.getById(params.id);
    return NextResponse.json({ data: factura });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/facturas/[id]
 * Actualiza estado, notas o sello recibido de una factura.
 * Usado principalmente para actualizar el resultado del envio a MH.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const body = await req.json();
    const data = updateFacturaSchema.parse(body);

    // Si viene cambio de status, usar metodo especializado
    if (data.status && (data.selloRecibido !== undefined)) {
      await FacturaRepository.updateStatus(
        params.id,
        data.status,
        data.selloRecibido ?? undefined
      );
      const factura = await FacturaService.getById(params.id);
      return NextResponse.json({ data: factura });
    }

    // Actualizar campos editables (notas, status)
    const factura = await FacturaRepository.update(params.id, {
      ...(data.notes !== undefined ? { notes: data.notes ?? undefined } : {}),
      ...(data.status ? { status: data.status } : {}),
    });
    return NextResponse.json({ data: factura });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/facturas/[id]
 * Cancelacion logica de una factura (soft — cambia status a CANCELLED).
 * Solo aplica a facturas en estado DRAFT o SENT.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    await FacturaService.cancel(params.id);
    return NextResponse.json({
      data: { message: "Factura cancelada correctamente" },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

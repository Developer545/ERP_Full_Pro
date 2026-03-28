import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { POSService } from "@/modules/pos/pos.service";
import { posVentaSchema } from "@/modules/pos/pos.schema";

/**
 * POST /api/v1/pos/venta
 * Procesa una venta completa desde el Punto de Venta.
 *
 * Body: POSVenta (validado con posVentaSchema)
 * Retorna: { data: { invoice, change } }
 *
 * La transaccion incluye:
 * - Verificacion de stock
 * - Creacion de factura e items
 * - Descuento de stock
 * - Movimientos de inventario (Kardex)
 * - CxC si el metodo de pago es CREDIT
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();

    // Validar esquema de la venta
    const data = posVentaSchema.parse(body);

    // Procesar la venta en el servicio
    const result = await POSService.procesarVenta(data);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

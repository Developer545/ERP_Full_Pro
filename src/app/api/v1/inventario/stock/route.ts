import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { InventarioService } from "@/modules/inventario/inventario.service";

/**
 * GET /api/v1/inventario/stock
 * Resumen de stock por producto — incluye alerta de stock bajo.
 * Util para alertas del dashboard y modulo de inventario.
 */
export const GET = withApi(async () => {
  try {
    const resumen = await InventarioService.getResumenStock();
    return NextResponse.json({ data: resumen });
  } catch (error) {
    return handleApiError(error);
  }
});

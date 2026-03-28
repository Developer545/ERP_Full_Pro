import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { InventarioService } from "@/modules/inventario/inventario.service";

/**
 * GET /api/v1/inventario/kardex/[productId]
 * Kardex completo de un producto con saldo corrido.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const { productId } = params;
    const kardex = await InventarioService.getKardex(productId);
    return NextResponse.json({ data: kardex });
  } catch (error) {
    return handleApiError(error);
  }
});

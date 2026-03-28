import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { POSService } from "@/modules/pos/pos.service";

/**
 * GET /api/v1/pos/productos
 * Busca productos activos con stock disponible para el catalogo del POS.
 *
 * Query params:
 *   q — termino de busqueda (nombre, SKU, codigo de barras)
 *
 * Retorna maximo 20 resultados ordenados por nombre.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("q") ?? undefined;

    const productos = await POSService.buscarProductos(search);

    return NextResponse.json({ data: productos });
  } catch (error) {
    return handleApiError(error);
  }
});

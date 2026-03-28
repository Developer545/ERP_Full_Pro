import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ProductoService } from "@/modules/productos/producto.service";
import { updateProductoSchema } from "@/modules/productos/producto.schema";

/**
 * GET /api/v1/productos/[id]
 * Obtiene un producto por ID.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const producto = await ProductoService.getById(params.id);
    return NextResponse.json({ data: producto });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/productos/[id]
 * Actualiza un producto existente.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const body = await req.json();
    const data = updateProductoSchema.parse(body);
    const producto = await ProductoService.update(params.id, data);
    return NextResponse.json({ data: producto });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/productos/[id]
 * Soft delete de un producto.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    await ProductoService.delete(params.id);
    return NextResponse.json({ data: { message: "Producto eliminado correctamente" } });
  } catch (error) {
    return handleApiError(error);
  }
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CategoriaService } from "@/modules/categorias/categoria.service";
import { updateCategoriaSchema } from "@/modules/categorias/categoria.schema";

/**
 * GET /api/v1/categorias/[id]
 * Obtiene una categoria por ID.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const categoria = await CategoriaService.getById(params.id);
    return NextResponse.json({ data: categoria });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/categorias/[id]
 * Actualiza una categoria existente.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const body = await req.json();
    const data = updateCategoriaSchema.parse(body);
    const categoria = await CategoriaService.update(params.id, data);
    return NextResponse.json({ data: categoria });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/categorias/[id]
 * Soft delete de una categoria.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    await CategoriaService.delete(params.id);
    return NextResponse.json({ data: { message: "Categoria eliminada correctamente" } });
  } catch (error) {
    return handleApiError(error);
  }
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { GastosService } from "@/modules/gastos/gastos.service";
import { createCategoriaSchema } from "@/modules/gastos/gastos.schema";

/**
 * GET /api/v1/gastos/categorias
 * Lista todas las categorias de gastos activas del tenant.
 */
export const GET = withApi(async () => {
  try {
    const categorias = await GastosService.getCategorias();
    return NextResponse.json({ data: categorias });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/v1/gastos/categorias
 * Crea una nueva categoria de gasto.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createCategoriaSchema.parse(body);
    const categoria = await GastosService.createCategoria(data);
    return NextResponse.json({ data: categoria }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

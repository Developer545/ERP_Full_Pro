import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { GastosService } from "@/modules/gastos/gastos.service";
import { updateGastoSchema } from "@/modules/gastos/gastos.schema";

/**
 * GET /api/v1/gastos/[id]
 * Obtiene un gasto por ID.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const gasto = await GastosService.getById(id);
    return NextResponse.json({ data: gasto });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/gastos/[id]
 * Actualiza un gasto existente.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const data = updateGastoSchema.parse(body);
    const gasto = await GastosService.update(id, data);
    return NextResponse.json({ data: gasto });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/gastos/[id]
 * Elimina (soft delete) un gasto.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    await GastosService.delete(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
});

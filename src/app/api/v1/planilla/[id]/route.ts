import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PlanillaService } from "@/modules/planilla/planilla.service";

/**
 * GET /api/v1/planilla/[id]
 * Retorna una planilla completa con todos los detalles de empleados.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const planilla = await PlanillaService.getById(params.id);
    return NextResponse.json({ data: planilla });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/planilla/[id]
 * Soft delete de una planilla. Solo aplica en estado BORRADOR.
 * Roles: ADMIN.
 */
export const DELETE = withApi(
  async (_req, { params }) => {
    try {
      await PlanillaService.delete(params.id);
      return NextResponse.json({
        data: { message: "Planilla eliminada correctamente" },
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN"] }
);

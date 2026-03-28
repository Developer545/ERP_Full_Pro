import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PlanillaService } from "@/modules/planilla/planilla.service";

/**
 * PUT /api/v1/planilla/[id]/cerrar
 * Cierra una planilla (BORRADOR → CERRADA).
 * Roles: ADMIN.
 */
export const PUT = withApi(
  async (_req, { params }) => {
    try {
      const planilla = await PlanillaService.cerrar(params.id);
      return NextResponse.json({ data: planilla });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN"] }
);

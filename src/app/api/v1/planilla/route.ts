import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PlanillaService } from "@/modules/planilla/planilla.service";
import { generarPlanillaSchema, filtroPlanillaSchema } from "@/modules/planilla/planilla.schema";

/**
 * GET /api/v1/planilla
 * Lista las planillas del tenant con filtros opcionales.
 *
 * Query params: mes, anio, estado, page, pageSize
 */
export const GET = withApi(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const filtros = filtroPlanillaSchema.parse({
      mes:      searchParams.get("mes")      ?? undefined,
      anio:     searchParams.get("anio")     ?? undefined,
      estado:   searchParams.get("estado")   ?? undefined,
      page:     searchParams.get("page")     ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });
    const result = await PlanillaService.getAll(filtros);
    return NextResponse.json({
      data: result.items,
      meta: {
        total:      result.total,
        page:       result.page,
        pageSize:   result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/v1/planilla
 * Genera una nueva planilla para el periodo indicado.
 * Roles: ADMIN.
 */
export const POST = withApi(
  async (req) => {
    try {
      const body = await req.json();
      const data = generarPlanillaSchema.parse(body);
      const planilla = await PlanillaService.generar(data);
      return NextResponse.json({ data: planilla }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN"] }
);

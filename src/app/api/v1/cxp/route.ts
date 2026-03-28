import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxPService } from "@/modules/cxp/cxp.service";
import { filterCxPSchema, createCxPSchema } from "@/modules/cxp/cxp.schema";

/**
 * GET /api/v1/cxp
 * Lista paginada de cuentas por pagar con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      supplierId: url.searchParams.get("supplierId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = filterCxPSchema.parse(rawParams);
    const { items, total } = await CxPService.getAll(filtros);

    return NextResponse.json({
      data: items,
      meta: {
        total,
        page: filtros.page,
        pageSize: filtros.pageSize,
        totalPages: Math.ceil(total / filtros.pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/v1/cxp
 * Crea una nueva cuenta por pagar.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createCxPSchema.parse(body);
    const cxp = await CxPService.create(data);
    return NextResponse.json({ data: cxp }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

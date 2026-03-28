import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { GastosService } from "@/modules/gastos/gastos.service";
import { filterGastosSchema, createGastoSchema } from "@/modules/gastos/gastos.schema";

/**
 * GET /api/v1/gastos
 * Lista paginada de gastos con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      paymentMethod: url.searchParams.get("paymentMethod") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = filterGastosSchema.parse(rawParams);
    const { items, total } = await GastosService.getAll(filtros);

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
 * POST /api/v1/gastos
 * Crea un nuevo gasto.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createGastoSchema.parse(body);
    const gasto = await GastosService.create(data);
    return NextResponse.json({ data: gasto }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

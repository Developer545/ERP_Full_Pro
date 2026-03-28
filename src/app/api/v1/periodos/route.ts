import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { PeriodoService } from "@/modules/contabilidad/periodo.service";
import { createPeriodoSchema, filterPeriodosSchema } from "@/modules/contabilidad/periodo.schema";

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const filtros = filterPeriodosSchema.parse({
      anio: url.searchParams.get("anio") ?? undefined,
      estado: url.searchParams.get("estado") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const { items, total } = await PeriodoService.getAll(filtros);
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

export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createPeriodoSchema.parse(body);
    const periodo = await PeriodoService.create(data);
    return NextResponse.json({ data: periodo }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

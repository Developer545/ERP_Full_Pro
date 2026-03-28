import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CuentaService } from "@/modules/contabilidad/cuenta.service";
import { createCuentaSchema, filterCuentasSchema } from "@/modules/contabilidad/cuenta.schema";

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const filtros = filterCuentasSchema.parse({
      search: url.searchParams.get("search") ?? undefined,
      tipo: url.searchParams.get("tipo") ?? undefined,
      parentId: url.searchParams.get("parentId") ?? undefined,
      soloMovimiento: url.searchParams.get("soloMovimiento") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const { items, total } = await CuentaService.getAll(filtros);
    return NextResponse.json({
      data: items,
      meta: { total, page: filtros.page, pageSize: filtros.pageSize, totalPages: Math.ceil(total / filtros.pageSize) },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createCuentaSchema.parse(body);
    const cuenta = await CuentaService.create(data);
    return NextResponse.json({ data: cuenta }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

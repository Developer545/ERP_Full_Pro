import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AsientoService } from "@/modules/contabilidad/asiento.service";
import { createAsientoSchema, filterAsientosSchema } from "@/modules/contabilidad/asiento.schema";

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const filtros = filterAsientosSchema.parse({
      search: url.searchParams.get("search") ?? undefined,
      estado: url.searchParams.get("estado") ?? undefined,
      desde: url.searchParams.get("desde") ?? undefined,
      hasta: url.searchParams.get("hasta") ?? undefined,
      origen: url.searchParams.get("origen") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const { items, total } = await AsientoService.getAll(filtros);
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
    const data = createAsientoSchema.parse(body);
    const asiento = await AsientoService.create(data);
    return NextResponse.json({ data: asiento }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

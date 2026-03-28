import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxCService } from "@/modules/cxc/cxc.service";
import { filterCxCSchema } from "@/modules/cxc/cxc.schema";

/**
 * GET /api/v1/cxc
 * Lista paginada de cuentas por cobrar con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      customerId: url.searchParams.get("customerId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = filterCxCSchema.parse(rawParams);
    const { items, total } = await CxCService.getAll(filtros);

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

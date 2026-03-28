import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ComprasService } from "@/modules/compras/compras.service";
import { createCompraSchema, compraFiltrosSchema } from "@/modules/compras/compras.schema";

/**
 * GET /api/v1/compras
 * Lista paginada de ordenes de compra con filtros opcionales.
 * Parametros: search, status, supplierId, from, to, page, pageSize
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      supplierId: url.searchParams.get("supplierId") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = compraFiltrosSchema.parse(rawParams);
    const result = await ComprasService.getAll(filtros);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/v1/compras
 * Crea una nueva orden de compra.
 * Requiere autenticacion. Roles: ADMIN, MANAGER.
 */
export const POST = withApi(
  async (req) => {
    try {
      const body = await req.json();
      const data = createCompraSchema.parse(body);
      const oc = await ComprasService.create(data);
      return NextResponse.json({ data: oc }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { FacturaService } from "@/modules/facturas/factura.service";
import { createFacturaSchema, facturaFiltrosSchema } from "@/modules/facturas/factura.schema";

/**
 * GET /api/v1/facturas
 * Lista paginada de facturas con filtros opcionales.
 * Parametros: search, status, tipoDoc, from, to, page, pageSize
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      tipoDoc: url.searchParams.get("tipoDoc") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = facturaFiltrosSchema.parse(rawParams);
    const { items, total } = await FacturaService.getAll(filtros);

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
 * POST /api/v1/facturas
 * Crea una nueva factura DTE.
 * Requiere autenticacion. Genera correlativo, codigoGeneracion, descuenta stock.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createFacturaSchema.parse(body);
    const factura = await FacturaService.create(data);
    return NextResponse.json({ data: factura }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

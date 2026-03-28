import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ClienteService } from "@/modules/clientes/cliente.service";
import {
  createClienteSchema,
  filterClienteSchema,
} from "@/modules/clientes/cliente.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

/**
 * GET /api/v1/clientes
 * Lista paginada de clientes con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      docType: url.searchParams.get("docType") ?? undefined,
      isActive: url.searchParams.get("isActive") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    };

    const filters = filterClienteSchema.parse(rawParams);
    const { items, total } = await ClienteService.list(filters);

    return NextResponse.json({
      data: items,
      meta: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/v1/clientes
 * Crea un nuevo cliente.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createClienteSchema.parse(body);
    const cliente = await ClienteService.create(data);
    return NextResponse.json({ data: cliente }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

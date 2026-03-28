import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CategoriaService } from "@/modules/categorias/categoria.service";
import {
  createCategoriaSchema,
  filterCategoriaSchema,
} from "@/modules/categorias/categoria.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

/**
 * GET /api/v1/categorias
 * Lista paginada de categorias con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      isActive: url.searchParams.get("isActive") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    };

    const filters = filterCategoriaSchema.parse(rawParams);
    const { items, total } = await CategoriaService.list(filters);

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
 * POST /api/v1/categorias
 * Crea una nueva categoria.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createCategoriaSchema.parse(body);
    const categoria = await CategoriaService.create(data);
    return NextResponse.json({ data: categoria }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

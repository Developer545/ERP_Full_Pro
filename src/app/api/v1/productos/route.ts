import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ProductoService } from "@/modules/productos/producto.service";
import {
  createProductoSchema,
  filterProductoSchema,
} from "@/modules/productos/producto.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

/**
 * GET /api/v1/productos
 * Lista paginada de productos con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      search: url.searchParams.get("search") ?? undefined,
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      isActive: url.searchParams.get("isActive") ?? undefined,
      lowStock: url.searchParams.get("lowStock") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    };

    const filters = filterProductoSchema.parse(rawParams);
    const { items, total } = await ProductoService.list(filters);

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
 * POST /api/v1/productos
 * Crea un nuevo producto.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createProductoSchema.parse(body);
    const producto = await ProductoService.create(data);
    return NextResponse.json({ data: producto }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

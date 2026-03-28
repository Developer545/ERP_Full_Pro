import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ProveedorService } from "@/modules/proveedores/proveedor.service";
import {
  createProveedorSchema,
  filterProveedorSchema,
} from "@/modules/proveedores/proveedor.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

/**
 * GET /api/v1/proveedores
 * Lista paginada de proveedores con filtros opcionales.
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

    const filters = filterProveedorSchema.parse(rawParams);
    const { items, total } = await ProveedorService.list(filters);

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
 * POST /api/v1/proveedores
 * Crea un nuevo proveedor.
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createProveedorSchema.parse(body);
    const proveedor = await ProveedorService.create(data);
    return NextResponse.json({ data: proveedor }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

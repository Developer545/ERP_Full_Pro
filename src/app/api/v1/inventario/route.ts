import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { InventarioService } from "@/modules/inventario/inventario.service";
import {
  createMovementSchema,
  filterMovimientoSchema,
} from "@/modules/inventario/inventario.schema";

/**
 * GET /api/v1/inventario
 * Lista paginada de movimientos de inventario con filtros opcionales.
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const rawParams = {
      productId: url.searchParams.get("productId") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    };

    const filtros = filterMovimientoSchema.parse(rawParams);
    const { items, total } = await InventarioService.getMovimientos(filtros);

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
 * POST /api/v1/inventario
 * Crea un movimiento manual de inventario (ajuste, entrada, salida).
 */
export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createMovementSchema.parse(body);
    const movimiento = await InventarioService.createMovimiento(data);
    return NextResponse.json({ data: movimiento }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

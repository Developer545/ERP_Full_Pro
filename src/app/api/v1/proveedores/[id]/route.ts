import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ProveedorService } from "@/modules/proveedores/proveedor.service";
import { updateProveedorSchema } from "@/modules/proveedores/proveedor.schema";

/**
 * GET /api/v1/proveedores/[id]
 * Obtiene un proveedor por ID.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const proveedor = await ProveedorService.getById(params.id);
    return NextResponse.json({ data: proveedor });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/proveedores/[id]
 * Actualiza un proveedor existente.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const body = await req.json();
    const data = updateProveedorSchema.parse(body);
    const proveedor = await ProveedorService.update(params.id, data);
    return NextResponse.json({ data: proveedor });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/proveedores/[id]
 * Soft delete de un proveedor.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    await ProveedorService.delete(params.id);
    return NextResponse.json({ data: { message: "Proveedor eliminado correctamente" } });
  } catch (error) {
    return handleApiError(error);
  }
});

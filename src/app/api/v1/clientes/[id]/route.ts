import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ClienteService } from "@/modules/clientes/cliente.service";
import { updateClienteSchema } from "@/modules/clientes/cliente.schema";

/**
 * GET /api/v1/clientes/[id]
 * Obtiene un cliente por ID.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const cliente = await ClienteService.getById(params.id);
    return NextResponse.json({ data: cliente });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/clientes/[id]
 * Actualiza un cliente existente.
 */
export const PUT = withApi(async (req, { params }) => {
  try {
    const body = await req.json();
    const data = updateClienteSchema.parse(body);
    const cliente = await ClienteService.update(params.id, data);
    return NextResponse.json({ data: cliente });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * DELETE /api/v1/clientes/[id]
 * Soft delete de un cliente.
 */
export const DELETE = withApi(async (_req, { params }) => {
  try {
    await ClienteService.delete(params.id);
    return NextResponse.json({ data: { message: "Cliente eliminado correctamente" } });
  } catch (error) {
    return handleApiError(error);
  }
});

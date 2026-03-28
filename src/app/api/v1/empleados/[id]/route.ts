import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { EmpleadoService } from "@/modules/empleados/empleado.service";
import { updateEmpleadoSchema } from "@/modules/empleados/empleado.schema";

/**
 * GET /api/v1/empleados/[id]
 * Obtiene un empleado por ID.
 */
export const GET = withApi(
  async (_req, { params }) => {
    try {
      const empleado = await EmpleadoService.getById(params.id);
      return NextResponse.json({ data: empleado });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

/**
 * PUT /api/v1/empleados/[id]
 * Actualiza un empleado existente.
 */
export const PUT = withApi(
  async (req, { params }) => {
    try {
      const body = await req.json();
      const data = updateEmpleadoSchema.parse(body);
      const empleado = await EmpleadoService.update(params.id, data);
      return NextResponse.json({ data: empleado });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

/**
 * DELETE /api/v1/empleados/[id]
 * Soft delete de un empleado.
 */
export const DELETE = withApi(
  async (_req, { params }) => {
    try {
      await EmpleadoService.delete(params.id);
      return NextResponse.json({
        data: { message: "Empleado eliminado correctamente" },
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

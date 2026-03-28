import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { EmpleadoService } from "@/modules/empleados/empleado.service";

/**
 * GET /api/v1/empleados/activos
 * Lista simple de empleados activos para selects (sin paginacion).
 * Usado en planilla y otros modulos que necesitan listar empleados.
 */
export const GET = withApi(async () => {
  try {
    const empleados = await EmpleadoService.getActivos();
    return NextResponse.json({ data: empleados });
  } catch (error) {
    return handleApiError(error);
  }
});

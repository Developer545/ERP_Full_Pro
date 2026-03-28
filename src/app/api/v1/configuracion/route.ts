import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ConfiguracionService } from "@/modules/configuracion/configuracion.service";
import { updateConfiguracionSchema } from "@/modules/configuracion/configuracion.schema";

/**
 * GET /api/v1/configuracion
 * Retorna la configuracion del tenant actual.
 */
export const GET = withApi(async () => {
  try {
    const configuracion = await ConfiguracionService.get();
    return NextResponse.json({ data: configuracion });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * PUT /api/v1/configuracion
 * Actualiza la configuracion del tenant (solo ADMIN).
 */
export const PUT = withApi(
  async (req) => {
    try {
      const body = await req.json();
      const data = updateConfiguracionSchema.parse(body);
      const configuracion = await ConfiguracionService.update(data);
      return NextResponse.json({ data: configuracion });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

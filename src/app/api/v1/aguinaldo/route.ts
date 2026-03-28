import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AguinaldoService } from "@/modules/aguinaldo/aguinaldo.service";

/**
 * GET /api/v1/aguinaldo
 * Retorna el calculo de aguinaldo para todos los empleados activos del tenant.
 *
 * Query params:
 *   anio (opcional) — año de referencia, por defecto el año actual
 */
export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const anioParam = url.searchParams.get("anio");
    const anio = anioParam ? parseInt(anioParam, 10) : undefined;

    const resultado = await AguinaldoService.calcularAguinaldoTenant(anio);

    return NextResponse.json({ data: resultado });
  } catch (error) {
    return handleApiError(error);
  }
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CuentaService } from "@/modules/contabilidad/cuenta.service";

/** GET — devuelve el catálogo estándar SV (preview sin importar) */
export const GET = withApi(async () => {
  try {
    const catalogo = CuentaService.getCatalogoEstandar();
    return NextResponse.json({ data: catalogo });
  } catch (error) {
    return handleApiError(error);
  }
});

/** POST — importa el catálogo estándar directamente al tenant */
export const POST = withApi(async () => {
  try {
    const resultado = await CuentaService.importarCatalogoEstandar();
    return NextResponse.json({ data: resultado }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

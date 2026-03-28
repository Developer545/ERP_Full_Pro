import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { TipoAsientoService } from "@/modules/contabilidad/tipo-asiento.service";
import { createTipoAsientoSchema } from "@/modules/contabilidad/tipo-asiento.schema";

export const GET = withApi(async () => {
  try {
    const tipos = await TipoAsientoService.getAll();
    return NextResponse.json({ data: tipos });
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withApi(async (req) => {
  try {
    const body = await req.json();
    const data = createTipoAsientoSchema.parse(body);
    const tipo = await TipoAsientoService.create(data);
    return NextResponse.json({ data: tipo }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

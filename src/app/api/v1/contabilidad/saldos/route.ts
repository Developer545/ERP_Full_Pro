import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { AsientoService } from "@/modules/contabilidad/asiento.service";
import { z } from "zod";

const querySchema = z.object({
  desde: z.string().min(1),
  hasta: z.string().min(1),
});

export const GET = withApi(async (req) => {
  try {
    const url = new URL(req.url);
    const { desde, hasta } = querySchema.parse({
      desde: url.searchParams.get("desde"),
      hasta: url.searchParams.get("hasta"),
    });
    const saldos = await AsientoService.getSaldosCuentas(desde, hasta);
    return NextResponse.json({ data: saldos });
  } catch (error) {
    return handleApiError(error);
  }
});

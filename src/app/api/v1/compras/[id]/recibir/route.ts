import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { ComprasService } from "@/modules/compras/compras.service";
import { recibirItemSchema } from "@/modules/compras/compras.schema";

/**
 * PUT /api/v1/compras/[id]/recibir
 * Registra la recepcion de mercaderia de una OC.
 * Actualiza quantityReceived de los items, incrementa stock de productos
 * y registra movimientos de inventario (ENTRY).
 * Roles: ADMIN, MANAGER.
 *
 * Body: { items: [{ itemId: string, quantityReceived: number }] }
 */
export const PUT = withApi(
  async (req, { params }) => {
    try {
      const body = await req.json();
      const data = recibirItemSchema.parse(body);
      const oc = await ComprasService.recibirOrden(params.id, data);
      return NextResponse.json({ data: oc });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

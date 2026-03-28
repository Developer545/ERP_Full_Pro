import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { CxCService } from "@/modules/cxc/cxc.service";

/**
 * GET /api/v1/cxc/[id]
 * Obtiene una cuenta por cobrar por ID, incluyendo todos sus pagos.
 */
export const GET = withApi(async (_req, { params }) => {
  try {
    const { id } = params;
    const cxc = await CxCService.getById(id);
    return NextResponse.json({ data: cxc });
  } catch (error) {
    return handleApiError(error);
  }
});

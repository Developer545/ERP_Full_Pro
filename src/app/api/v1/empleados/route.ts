import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { EmpleadoService } from "@/modules/empleados/empleado.service";
import {
  createEmpleadoSchema,
  filterEmpleadoSchema,
} from "@/modules/empleados/empleado.schema";

/**
 * GET /api/v1/empleados
 * Lista paginada de empleados con filtros opcionales.
 */
export const GET = withApi(
  async (req) => {
    try {
      const url = new URL(req.url);
      const rawParams = {
        search: url.searchParams.get("search") ?? undefined,
        estado: url.searchParams.get("estado") ?? undefined,
        departamento: url.searchParams.get("departamento") ?? undefined,
        page: url.searchParams.get("page") ?? "1",
        pageSize: url.searchParams.get("pageSize") ?? "20",
      };

      const filtros = filterEmpleadoSchema.parse(rawParams);
      const { items, total } = await EmpleadoService.list(filtros);

      return NextResponse.json({
        data: items,
        meta: {
          total,
          page: filtros.page,
          pageSize: filtros.pageSize,
          totalPages: Math.ceil(total / filtros.pageSize),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

/**
 * POST /api/v1/empleados
 * Crea un nuevo empleado.
 */
export const POST = withApi(
  async (req) => {
    try {
      const body = await req.json();
      const data = createEmpleadoSchema.parse(body);
      const empleado = await EmpleadoService.create(data);
      return NextResponse.json({ data: empleado }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

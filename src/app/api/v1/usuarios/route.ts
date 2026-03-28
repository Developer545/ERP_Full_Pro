import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { UsuarioService } from "@/modules/usuarios/usuario.service";
import {
  createUsuarioSchema,
  filterUsuarioSchema,
} from "@/modules/usuarios/usuario.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

/**
 * GET /api/v1/usuarios
 * Lista paginada de usuarios (solo ADMIN y SUPER_ADMIN).
 */
export const GET = withApi(
  async (req) => {
    try {
      const url = new URL(req.url);
      const rawParams = {
        search: url.searchParams.get("search") ?? undefined,
        role: url.searchParams.get("role") ?? undefined,
        isActive: url.searchParams.get("isActive") ?? undefined,
        page: url.searchParams.get("page") ?? "1",
        pageSize: url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
      };

      const filters = filterUsuarioSchema.parse(rawParams);
      const { items, total } = await UsuarioService.list(filters);

      return NextResponse.json({
        data: items,
        meta: {
          total,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil(total / filters.pageSize),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

/**
 * POST /api/v1/usuarios
 * Crea un nuevo usuario con contrasena temporal (solo ADMIN).
 */
export const POST = withApi(
  async (req) => {
    try {
      const body = await req.json();
      const data = createUsuarioSchema.parse(body);
      const result = await UsuarioService.create(data);
      // Retornamos la contrasena temporal en la respuesta para que el admin la comparta
      return NextResponse.json(
        {
          data: {
            usuario: result.usuario,
            tempPassword: result.tempPassword,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

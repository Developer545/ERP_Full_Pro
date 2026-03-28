import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { UsuarioService } from "@/modules/usuarios/usuario.service";
import { updateUsuarioSchema } from "@/modules/usuarios/usuario.schema";

/**
 * GET /api/v1/usuarios/[id]
 * Obtiene un usuario por ID (solo ADMIN).
 */
export const GET = withApi(
  async (_req, { params }) => {
    try {
      const usuario = await UsuarioService.getById(params.id);
      return NextResponse.json({ data: usuario });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

/**
 * PUT /api/v1/usuarios/[id]
 * Actualiza un usuario existente (solo ADMIN).
 */
export const PUT = withApi(
  async (req, { params }) => {
    try {
      const body = await req.json();
      const data = updateUsuarioSchema.parse(body);
      const usuario = await UsuarioService.update(params.id, data);
      return NextResponse.json({ data: usuario });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

/**
 * DELETE /api/v1/usuarios/[id]
 * Soft delete de un usuario (solo ADMIN, no puede eliminarse a si mismo).
 */
export const DELETE = withApi(
  async (_req, { user, params }) => {
    try {
      await UsuarioService.delete(params.id, user.id);
      return NextResponse.json({ data: { message: "Usuario eliminado correctamente" } });
    } catch (error) {
      return handleApiError(error);
    }
  },
  { roles: ["ADMIN", "SUPER_ADMIN"] }
);

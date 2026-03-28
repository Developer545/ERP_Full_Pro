import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { UsuarioRepository } from "./usuario.repository";
import type { CreateUsuarioDto, UpdateUsuarioDto, FilterUsuarioDto } from "./usuario.schema";

/**
 * Genera una contrasena temporal aleatoria de 8 caracteres.
 * Cumple los requisitos: mayuscula + numero + caracteres.
 */
function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Sin I,O para evitar confusion
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789"; // Sin 0,1 para evitar confusion
  const special = "@#$!";

  const getRandom = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  const password = [
    getRandom(upper),
    getRandom(upper),
    getRandom(digits),
    getRandom(digits),
    getRandom(lower),
    getRandom(lower),
    getRandom(special),
    getRandom(lower),
  ];

  // Mezclar
  return password.sort(() => Math.random() - 0.5).join("");
}

/**
 * Servicio de Usuarios — logica de negocio y validaciones.
 */
export const UsuarioService = {
  /**
   * Lista paginada de usuarios (solo ADMIN).
   */
  async list(filters: FilterUsuarioDto) {
    return UsuarioRepository.findMany(filters);
  },

  /**
   * Obtiene un usuario por ID.
   */
  async getById(id: string) {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Usuario no encontrado", 404);
    }
    return usuario;
  },

  /**
   * Crea un nuevo usuario con contrasena temporal.
   * Retorna el usuario y la contrasena temporal para mostrar al admin.
   */
  async create(data: CreateUsuarioDto) {
    const tenantId = getCurrentTenantId();

    // Verificar que el email no este en uso en el tenant
    const existing = await UsuarioRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(
        ErrorCodes.DUPLICATE,
        `Ya existe un usuario con el email "${data.email}"`,
        409
      );
    }

    // Generar y hashear contrasena temporal
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    const usuario = await UsuarioRepository.create({
      name: data.name,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      tenantId,
    });

    return { usuario, tempPassword };
  },

  /**
   * Actualiza un usuario existente.
   */
  async update(id: string, data: UpdateUsuarioDto) {
    await this.getById(id);
    const usuario = await UsuarioRepository.update(id, data);
    return usuario;
  },

  /**
   * Elimina un usuario (soft delete).
   * No puede eliminar al propio usuario que hace la request.
   */
  async delete(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new AppError(
        "CANNOT_DELETE_SELF",
        "No puedes eliminar tu propio usuario",
        422
      );
    }
    await this.getById(id);
    await UsuarioRepository.delete(id);
  },
};

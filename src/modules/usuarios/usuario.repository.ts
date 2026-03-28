import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { FilterUsuarioDto } from "./usuario.schema";
import { Prisma } from "@prisma/client";

/** Campos seguros para retornar (sin password, sin secretos 2FA) */
const SAFE_FIELDS = {
  id: true,
  tenantId: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  isActive: true,
  twoFactorEnabled: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

/**
 * Repositorio de Usuarios — solo queries Prisma, sin logica de negocio.
 */
export const UsuarioRepository = {
  /**
   * Lista paginada de usuarios del tenant actual.
   */
  async findMany(filters: FilterUsuarioDto) {
    const tenantId = getCurrentTenantId();
    const { search, role, isActive, page, pageSize } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(role && { role: role as any }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: SAFE_FIELDS,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Busca un usuario por ID dentro del tenant actual.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.user.findFirst({
      where: { id, tenantId },
      select: SAFE_FIELDS,
    });
  },

  /**
   * Busca un usuario por email dentro del tenant actual.
   */
  async findByEmail(email: string) {
    const tenantId = getCurrentTenantId();
    return prisma.user.findFirst({
      where: { email, tenantId },
      select: { id: true, email: true },
    });
  },

  /**
   * Crea un nuevo usuario con contrasena hasheada.
   */
  async create(data: {
    name: string;
    email: string;
    role: string;
    password: string;
    tenantId: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: data.role as any,
        password: data.password,
        tenantId: data.tenantId,
        mustChangePassword: true, // Debe cambiar contrasena en primer login
      },
      select: SAFE_FIELDS,
    });
  },

  /**
   * Actualiza un usuario existente.
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    const tenantId = getCurrentTenantId();
    return prisma.user.update({
      where: { id, tenantId },
      data,
      select: SAFE_FIELDS,
    });
  },

  /**
   * Soft delete de un usuario.
   */
  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.user.delete({
      where: { id, tenantId },
    });
  },
};

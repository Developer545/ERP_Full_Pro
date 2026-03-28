import { prisma } from "@/lib/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateTokenPair, verifyToken, COOKIE_NAMES } from "@/lib/auth/tokens";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { slugify, slugifyUnique } from "@/lib/utils/slugify";
import { PLAN_LIMITS } from "@/config/features";
import { getModuleLogger } from "@/lib/logger";
import type { LoginInput, RegisterInput } from "./auth.schema";
import type { ClientUser } from "@/types/auth";

const log = getModuleLogger("auth.service");

export class AuthService {

  /**
   * Autentica un usuario con email y contraseña.
   * Retorna el par de tokens y los datos del usuario.
   */
  static async login(data: LoginInput, ipAddress?: string) {
    // Buscar usuario por email (activo, sin soft-delete)
    // Nota: findFirst porque puede haber mismo email en tenants distintos
    const user = await prisma.user.findFirst({
      where: { email: data.email, isActive: true, deletedAt: null },
      include: { tenant: { select: { id: true, slug: true, status: true, plan: true } } },
    });

    if (!user) {
      throw new AppError(ErrorCodes.INVALID_CREDENTIALS, "Credenciales incorrectas", 401);
    }

    if (user.tenant.status === "SUSPENDED") {
      throw new AppError(ErrorCodes.FORBIDDEN, "Tu cuenta esta suspendida. Contacta soporte.", 403);
    }

    const passwordOk = await verifyPassword(data.password, user.password);
    if (!passwordOk) {
      throw new AppError(ErrorCodes.INVALID_CREDENTIALS, "Credenciales incorrectas", 401);
    }

    // Generar tokens
    const tokens = await generateTokenPair({
      sub: user.id,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    // Guardar refresh token hasheado en BD
    const refreshPayload = await verifyToken(tokens.refreshToken);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken.slice(-32), // guardar solo sufijo (no el token completo)
        jti: refreshPayload.jti || crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
      },
    });

    // Actualizar ultimo login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    log.info({ userId: user.id, tenantId: user.tenantId }, "User logged in");

    const clientUser: ClientUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
      avatar: user.avatar || undefined,
    };

    return { user: clientUser, tokens };
  }

  /**
   * Registra un nuevo tenant (empresa) con su usuario administrador.
   * Crea el tenant en plan FREE con 14 dias de trial.
   */
  static async register(data: RegisterInput, ipAddress?: string) {
    // Verificar que el email no este en uso
    const existing = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existing) {
      throw new AppError("EMAIL_IN_USE", "Este correo ya esta registrado", 409);
    }

    // Generar slug unico para el tenant
    let slug = slugify(data.companyName);
    let slugSuffix = 0;
    while (true) {
      const candidate = slugifyUnique(data.companyName, slugSuffix || undefined);
      const exists = await prisma.tenant.findUnique({ where: { slug: candidate } });
      if (!exists) { slug = candidate; break; }
      slugSuffix++;
    }

    const hashedPassword = await hashPassword(data.password);
    const limits = PLAN_LIMITS.FREE;
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias

    // Crear tenant + usuario admin en una transaccion
    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          slug,
          plan: "FREE",
          status: "TRIAL",
          trialEndsAt,
          maxUsers: limits.maxUsers,
          maxProducts: limits.maxProducts,
          maxInvoicesPerMonth: limits.maxInvoicesPerMonth,
          settings: {
            currency: "USD",
            timezone: "America/El_Salvador",
            dateFormat: "DD/MM/YYYY",
          },
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: data.ownerName,
          email: data.email,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
        },
      });

      return { tenant, user };
    });

    // Generar tokens
    const tokens = await generateTokenPair({
      sub: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    // Guardar sesion
    const refreshPayload = await verifyToken(tokens.refreshToken);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken.slice(-32),
        jti: refreshPayload.jti || crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
      },
    });

    log.info({ userId: user.id, tenantId: tenant.id, slug }, "New tenant registered");

    const clientUser: ClientUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };

    return { user: clientUser, tenantSlug: tenant.slug, tokens };
  }

  /**
   * Rota el refresh token y genera un nuevo par de tokens.
   * Invalida la sesion anterior (refresh token rotation).
   */
  static async refresh(refreshToken: string) {
    const payload = await verifyToken(refreshToken);

    if (payload.type !== "refresh") {
      throw new AppError(ErrorCodes.TOKEN_INVALID, "Token invalido", 401);
    }

    // Verificar que la sesion existe y no fue invalidada
    const session = await prisma.session.findUnique({
      where: { jti: payload.jti || "" },
      include: { user: { include: { tenant: { select: { slug: true, status: true } } } } },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError(ErrorCodes.TOKEN_EXPIRED, "Sesion expirada", 401);
    }

    if (!session.user.isActive || session.user.tenant.status === "SUSPENDED") {
      throw new AppError(ErrorCodes.FORBIDDEN, "Cuenta inactiva o suspendida", 403);
    }

    // Generar nuevos tokens
    const newTokens = await generateTokenPair({
      sub: session.user.id,
      tenantId: session.user.tenantId,
      tenantSlug: session.user.tenant.slug,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name,
    });

    // Rotar: eliminar sesion vieja, crear nueva
    const newRefreshPayload = await verifyToken(newTokens.refreshToken);
    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: session.user.id,
          refreshToken: newTokens.refreshToken.slice(-32),
          jti: newRefreshPayload.jti || crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: session.ipAddress || undefined,
        },
      }),
    ]);

    return { tokens: newTokens };
  }

  /**
   * Invalida la sesion actual del usuario (logout).
   */
  static async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload = await verifyToken(refreshToken);
      if (payload.jti) {
        await prisma.session.deleteMany({ where: { jti: payload.jti } });
      }
    } catch {
      // Token ya expirado — ignorar
    }
  }
}

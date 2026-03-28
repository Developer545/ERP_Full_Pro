import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { cached, invalidateCache } from "@/lib/cache/cache";
import { tenantKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { prisma } from "@/lib/prisma/client";
import type { UpdateConfiguracionDto } from "./configuracion.schema";

/**
 * Servicio de Configuracion del Tenant — logica de negocio.
 */
export const ConfiguracionService = {
  /**
   * Obtiene la configuracion completa del tenant actual.
   */
  async get() {
    const tenantId = getCurrentTenantId();
    return cached(
      tenantKeys.settings(tenantId),
      async () => {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true,
            settings: true,
            dteConfig: true,
            maxUsers: true,
            maxProducts: true,
            maxInvoicesPerMonth: true,
            trialEndsAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!tenant) {
          throw new AppError(ErrorCodes.NOT_FOUND, "Configuracion de empresa no encontrada", 404);
        }

        return tenant;
      },
      3600 // 1 hora — configuracion cambia muy poco
    );
  },

  /**
   * Actualiza la configuracion del tenant.
   * Los datos de la empresa van al modelo Tenant,
   * los datos DTE van al campo JSON dteConfig.
   */
  async update(data: UpdateConfiguracionDto) {
    const tenantId = getCurrentTenantId();

    // Obtener config actual para merge del JSON dteConfig
    const current = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { dteConfig: true, settings: true },
    });

    if (!current) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Tenant no encontrado", 404);
    }

    // Merge DTE config (no reemplazar todo el JSON)
    const currentDte = (current.dteConfig as Record<string, unknown>) ?? {};
    const updatedDte = data.dte ? { ...currentDte, ...data.dte } : currentDte;

    // Merge settings
    const currentSettings = (current.settings as Record<string, unknown>) ?? {};
    const updatedSettings = {
      ...currentSettings,
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.logo !== undefined && { logo: data.logo }),
    };

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { name: data.name }),
        settings: updatedSettings as never,
        dteConfig: updatedDte as never,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        settings: true,
        dteConfig: true,
        maxUsers: true,
        maxProducts: true,
        maxInvoicesPerMonth: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidar cache
    await invalidateCache(tenantKeys.settings(tenantId));

    return tenant;
  },
};

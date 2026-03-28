import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId } from "@/lib/tenant/context";
import type { CreateTipoAsientoInput } from "./tipo-asiento.types";

// Tipos predefinidos del sistema (tenantId null)
const TIPOS_SISTEMA = ["DIARIO", "AJUSTE", "CIERRE", "APERTURA"];
const COLORES_SISTEMA: Record<string, string> = {
  DIARIO: "blue",
  AJUSTE: "orange",
  CIERRE: "red",
  APERTURA: "green",
};

export const TipoAsientoRepository = {
  async findAll() {
    const tenantId = getCurrentTenantId();

    // Retorna predefinidos del sistema + personalizados del tenant
    const tipos = await prisma.journalType.findMany({
      where: {
        activo: true,
        OR: [{ tenantId: null }, { tenantId }],
      },
      orderBy: { nombre: "asc" },
    });

    return tipos;
  },

  async findById(id: string) {
    return prisma.journalType.findFirst({ where: { id } });
  },

  async seedSistema() {
    // Inserta los tipos del sistema si no existen
    for (const nombre of TIPOS_SISTEMA) {
      await prisma.journalType.upsert({
        where: { tenantId_nombre: { tenantId: "system", nombre } },
        create: {
          tenantId: null,
          nombre,
          color: COLORES_SISTEMA[nombre] ?? "blue",
          activo: true,
        },
        update: {},
      });
    }
  },

  async create(data: CreateTipoAsientoInput) {
    const tenantId = getCurrentTenantId();
    return prisma.journalType.create({
      data: {
        tenantId,
        nombre: data.nombre.toUpperCase(),
        color: data.color ?? "blue",
        activo: true,
      },
    });
  },

  async delete(id: string) {
    const tenantId = getCurrentTenantId();
    // Solo permite eliminar tipos del propio tenant, no los del sistema
    return prisma.journalType.update({
      where: { id, tenantId },
      data: { activo: false },
    });
  },
};

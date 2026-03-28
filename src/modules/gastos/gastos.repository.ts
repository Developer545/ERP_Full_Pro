import { prisma } from "@/lib/prisma/client";
import { getCurrentTenantId, getCurrentUserId } from "@/lib/tenant/context";
import type { Prisma } from "@prisma/client";
import type { GastosFiltros, CreateGastoInput, UpdateGastoInput, CreateCategoriaInput } from "./gastos.types";

/** Include por defecto para lista de gastos */
const GASTO_INCLUDE = {
  category: {
    select: { id: true, name: true, color: true },
  },
} as const;

/**
 * Repositorio de Gastos — solo queries Prisma, sin logica de negocio.
 */
export const GastosRepository = {
  /**
   * Lista paginada de gastos con filtros opcionales.
   */
  async findAll(filtros: GastosFiltros) {
    const tenantId = getCurrentTenantId();
    const {
      search,
      categoryId,
      from,
      to,
      paymentMethod,
      page = 1,
      pageSize = 20,
    } = filtros;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ExpenseWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { descripcion: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(paymentMethod && {
        paymentMethod: paymentMethod as Prisma.EnumPaymentMethodFilter,
      }),
      ...(from || to
        ? {
            fecha: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: GASTO_INCLUDE,
        orderBy: { fecha: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
    ]);

    return { items, total };
  },

  /**
   * Obtiene un gasto por ID.
   */
  async findById(id: string) {
    const tenantId = getCurrentTenantId();
    return prisma.expense.findFirst({
      where: { id, tenantId },
      include: GASTO_INCLUDE,
    });
  },

  /**
   * Crea un nuevo gasto.
   */
  async create(data: CreateGastoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.expense.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        descripcion: data.descripcion,
        monto: data.monto,
        paymentMethod: data.paymentMethod as import("@prisma/client").PaymentMethod,
        reference: data.reference,
        fecha: new Date(data.fecha),
        notes: data.notes,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      include: GASTO_INCLUDE,
    });
  },

  /**
   * Actualiza un gasto existente.
   */
  async update(id: string, data: UpdateGastoInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.expense.update({
      where: { id, tenantId },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.monto !== undefined && { monto: data.monto }),
        ...(data.paymentMethod !== undefined && {
          paymentMethod: data.paymentMethod as import("@prisma/client").PaymentMethod,
        }),
        ...(data.reference !== undefined && { reference: data.reference }),
        ...(data.fecha !== undefined && { fecha: new Date(data.fecha) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedBy: userId,
      },
      include: GASTO_INCLUDE,
    });
  },

  /**
   * Soft delete de un gasto.
   */
  async softDelete(id: string) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.expense.update({
      where: { id, tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  },

  /**
   * Totales del mes por categoria.
   * Devuelve un array con suma de montos agrupado por categoria.
   */
  async getTotalesMes(year: number, month: number) {
    const tenantId = getCurrentTenantId();
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0, 23, 59, 59, 999);

    // Total general del mes
    const totalAgg = await prisma.expense.aggregate({
      where: { tenantId, fecha: { gte: inicio, lte: fin } },
      _sum: { monto: true },
      _max: { monto: true },
    });

    // Gasto mayor del mes
    let gastoMayor: { descripcion: string; monto: number } | null = null;
    if (totalAgg._max.monto) {
      const gastoMayorRow = await prisma.expense.findFirst({
        where: {
          tenantId,
          fecha: { gte: inicio, lte: fin },
          monto: totalAgg._max.monto,
        },
        select: { descripcion: true, monto: true },
        orderBy: { monto: "desc" },
      });
      if (gastoMayorRow) {
        gastoMayor = {
          descripcion: gastoMayorRow.descripcion,
          monto: Number(gastoMayorRow.monto),
        };
      }
    }

    // Totales por categoria (raw group by usando groupBy de Prisma)
    const porCategoriaRaw = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: { tenantId, fecha: { gte: inicio, lte: fin } },
      _sum: { monto: true },
      orderBy: { _sum: { monto: "desc" } },
    });

    // Obtener nombres de categorias
    const categoryIds = porCategoriaRaw
      .filter((r) => r.categoryId !== null)
      .map((r) => r.categoryId as string);

    const categorias = categoryIds.length
      ? await prisma.expenseCategory.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, color: true },
        })
      : [];

    const categoriaMap = new Map(categorias.map((c) => [c.id, c]));

    const porCategoria = porCategoriaRaw.map((r) => {
      const cat = r.categoryId ? categoriaMap.get(r.categoryId) : undefined;
      return {
        categoryId: r.categoryId,
        categoryName: cat?.name ?? "Sin categoria",
        color: cat?.color ?? null,
        total: Number(r._sum.monto ?? 0),
      };
    });

    return {
      totalMes: Number(totalAgg._sum.monto ?? 0),
      gastoMayor,
      porCategoria,
    };
  },

  /**
   * Lista categorias activas del tenant.
   */
  async getCategorias() {
    const tenantId = getCurrentTenantId();
    return prisma.expenseCategory.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Crea una nueva categoria de gasto.
   */
  async createCategoria(data: CreateCategoriaInput) {
    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();

    return prisma.expenseCategory.create({
      data: {
        tenantId,
        name: data.name,
        color: data.color,
        isActive: true,
        createdBy: userId,
      },
    });
  },
};

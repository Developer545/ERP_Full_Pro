import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { handleApiError } from "@/lib/errors/error-handler";
import { cached } from "@/lib/cache/cache";
import { dashboardKeys } from "@/lib/cache/keys";
import { getCurrentTenantId } from "@/lib/tenant/context";
import { prisma } from "@/lib/prisma/client";

/**
 * GET /api/v1/dashboard
 * Retorna KPIs reales del dashboard del mes actual vs mes anterior.
 */
export const GET = withApi(async () => {
  try {
    const tenantId = getCurrentTenantId();

    const kpis = await cached(
      dashboardKeys.kpis(tenantId),
      async () => {
        const now = new Date();
        // Inicio y fin del mes actual
        const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
        const finMesActual = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Inicio y fin del mes anterior
        const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Queries en paralelo
        const [
          // Ventas mes actual (facturas aceptadas + enviadas + borradores del mes)
          ventasMesActualResult,
          // Count facturas mes actual
          facturasMesActual,
          // Ventas mes anterior
          ventasMesAnteriorResult,
          // Count facturas mes anterior
          facturasMesAnterior,
          // Clientes activos
          clientesActivos,
          // Productos con stock > 0
          productosEnStock,
          // Ultimas facturas (para tabla)
          ultimasFacturas,
        ] = await Promise.all([
          prisma.invoice.aggregate({
            where: {
              tenantId,
              status: { in: ["ACCEPTED", "SENT", "DRAFT"] },
              createdAt: { gte: inicioMesActual, lte: finMesActual },
            },
            _sum: { total: true },
          }),
          prisma.invoice.count({
            where: {
              tenantId,
              createdAt: { gte: inicioMesActual, lte: finMesActual },
            },
          }),
          prisma.invoice.aggregate({
            where: {
              tenantId,
              status: { in: ["ACCEPTED", "SENT", "DRAFT"] },
              createdAt: { gte: inicioMesAnterior, lte: finMesAnterior },
            },
            _sum: { total: true },
          }),
          prisma.invoice.count({
            where: {
              tenantId,
              createdAt: { gte: inicioMesAnterior, lte: finMesAnterior },
            },
          }),
          prisma.customer.count({
            where: { tenantId, isActive: true },
          }),
          prisma.product.count({
            where: { tenantId, isActive: true, stock: { gt: 0 } },
          }),
          prisma.invoice.findMany({
            where: { tenantId },
            select: {
              id: true,
              correlativo: true,
              tipoDoc: true,
              total: true,
              status: true,
              createdAt: true,
              customer: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ]);

        const ventasMes = Number(ventasMesActualResult._sum.total ?? 0);
        const ventasMesAnterior = Number(ventasMesAnteriorResult._sum.total ?? 0);

        return {
          ventasMes,
          facturasMes: facturasMesActual,
          clientesActivos,
          productosStock: productosEnStock,
          ventasMesAnterior,
          facturasMesAnterior,
          ultimasFacturas,
        };
      },
      300 // 5 minutos de cache
    );

    return NextResponse.json({ data: kpis });
  } catch (error) {
    return handleApiError(error);
  }
});

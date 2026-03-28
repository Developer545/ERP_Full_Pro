"use client";

import { useQuery } from "@tanstack/react-query";

const BASE_URL = "/api/v1/dashboard";

export const DASHBOARD_KEY = "dashboard";

export interface DashboardKPIs {
  ventasMes: number;
  facturasMes: number;
  clientesActivos: number;
  productosStock: number;
  ventasMesAnterior: number;
  facturasMesAnterior: number;
  ultimasFacturas: Array<{
    id: string;
    correlativo: string;
    tipoDoc: string;
    total: number;
    status: string;
    createdAt: string;
    customer?: { name: string } | null;
  }>;
}

async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener datos del dashboard");
  }
  const json = await res.json();
  return json.data;
}

/**
 * Hook para obtener los KPIs del dashboard.
 * Refresca cada 5 minutos.
 */
export function useDashboardKPIs() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "kpis"],
    queryFn: fetchDashboardKPIs,
    staleTime: 5 * 60_000, // 5 minutos
    refetchInterval: 5 * 60_000,
  });
}

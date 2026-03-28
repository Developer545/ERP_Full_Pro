import type { Metadata } from "next";
import { DashboardClient } from "@/components/modules/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | ERP Full Pro",
};

/**
 * Dashboard principal — pagina de inicio del ERP.
 * Fase 1: KPIs reales desde BD (ventas, clientes, stock, facturas).
 * Delega toda la interactividad y fetch a DashboardClient (React Query).
 */
export default function DashboardPage() {
  return <DashboardClient />;
}

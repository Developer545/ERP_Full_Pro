import type { Metadata } from "next";
import { EmpleadosClient } from "@/components/modules/empleados/EmpleadosClient";

export const metadata: Metadata = {
  title: "Empleados | ERP Full Pro",
  description: "Gestion del personal de la empresa",
};

/**
 * Pagina de Empleados — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function EmpleadosPage() {
  return <EmpleadosClient />;
}

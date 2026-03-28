import type { Metadata } from "next";
import { ProveedoresClient } from "@/components/modules/proveedores/ProveedoresClient";

export const metadata: Metadata = {
  title: "Proveedores | ERP Full Pro",
};

/**
 * Pagina de Proveedores — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function ProveedoresPage() {
  return <ProveedoresClient />;
}

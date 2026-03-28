import type { Metadata } from "next";
import { ClientesClient } from "@/components/modules/clientes/ClientesClient";

export const metadata: Metadata = {
  title: "Clientes | ERP Full Pro",
};

/**
 * Pagina de Clientes — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function ClientesPage() {
  return <ClientesClient />;
}

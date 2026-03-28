import type { Metadata } from "next";
import { CategoriasClient } from "@/components/modules/categorias/CategoriasClient";

export const metadata: Metadata = {
  title: "Categorias | ERP Full Pro",
};

/**
 * Pagina de Categorias — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function CategoriasPage() {
  return <CategoriasClient />;
}

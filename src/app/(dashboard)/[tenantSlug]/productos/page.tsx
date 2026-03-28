import type { Metadata } from "next";
import { ProductosClient } from "@/components/modules/productos/ProductosClient";

export const metadata: Metadata = {
  title: "Productos | ERP Full Pro",
};

/**
 * Pagina de Productos — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function ProductosPage() {
  return <ProductosClient />;
}

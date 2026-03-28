import type { Metadata } from "next";
import { POSClient } from "@/components/modules/pos/POSClient";

export const metadata: Metadata = {
  title: "Punto de Venta | ERP Full Pro",
};

/**
 * Pagina del Punto de Venta — Server Component.
 * Renderiza el POSClient que maneja toda la interactividad del POS.
 */
export default function POSPage() {
  return <POSClient />;
}

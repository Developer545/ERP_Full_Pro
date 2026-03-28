import type { Metadata } from "next";
import { CxPClient } from "@/components/modules/cxp/CxPClient";

export const metadata: Metadata = {
  title: "Cuentas por Pagar | ERP Full Pro",
};

/**
 * Pagina de Cuentas por Pagar — Server Component.
 * Renderiza el Client Component que maneja toda la interactividad.
 */
export default function CxPPage() {
  return <CxPClient />;
}

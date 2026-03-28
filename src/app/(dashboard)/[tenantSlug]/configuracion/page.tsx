import type { Metadata } from "next";
import { ConfiguracionClient } from "@/components/modules/configuracion/ConfiguracionClient";

export const metadata: Metadata = {
  title: "Configuracion | ERP Full Pro",
};

/**
 * Pagina de Configuracion — Server Component.
 * Formulario de datos de la empresa y configuracion DTE.
 */
export default function ConfiguracionPage() {
  return <ConfiguracionClient />;
}

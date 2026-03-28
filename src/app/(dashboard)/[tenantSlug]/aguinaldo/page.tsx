import type { Metadata } from "next";
import { AguinaldoClient } from "@/components/modules/aguinaldo/AguinaldoClient";

export const metadata: Metadata = {
  title: "Aguinaldo | ERP Full Pro",
};

/**
 * Pagina de Aguinaldo — Server Component.
 * Renderiza el Client Component que muestra el calculo de aguinaldo
 * segun el Codigo de Trabajo de El Salvador.
 */
export default function AguinaldoPage() {
  return <AguinaldoClient />;
}

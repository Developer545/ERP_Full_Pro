import type { Metadata } from "next";
import { EstadosFinancieros } from "@/components/modules/contabilidad/EstadosFinancieros";

export const metadata: Metadata = {
  title: "Estados Financieros | ERP Full Pro",
  description: "Balance General y Estado de Resultados",
};

export default function EstadosPage() {
  return <EstadosFinancieros />;
}

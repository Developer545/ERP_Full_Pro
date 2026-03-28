import type { Metadata } from "next";
import { LibroDiario } from "@/components/modules/contabilidad/LibroDiario";

export const metadata: Metadata = {
  title: "Libros Contables | ERP Full Pro",
  description: "Libro Diario General",
};

export default function LibrosPage() {
  return <LibroDiario />;
}

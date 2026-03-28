import type { Metadata } from "next";
import { AsientosClient } from "@/components/modules/contabilidad/AsientosClient";

export const metadata: Metadata = {
  title: "Asientos Contables | ERP Full Pro",
  description: "Diario general y asientos contables",
};

export default function AsientosPage() {
  return <AsientosClient />;
}

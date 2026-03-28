import type { Metadata } from "next";
import { GastosClient } from "@/components/modules/gastos/GastosClient";

export const metadata: Metadata = {
  title: "Gastos | ERP Full Pro",
  description: "Control de egresos y gastos operativos",
};

export default function GastosPage() {
  return <GastosClient />;
}

import type { Metadata } from "next";
import { FacturasClient } from "@/components/modules/facturas/FacturasClient";

export const metadata: Metadata = {
  title: "Facturas DTE | ERP Full Pro",
};

export default function FacturasPage() {
  return <FacturasClient />;
}

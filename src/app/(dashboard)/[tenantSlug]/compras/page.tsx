import type { Metadata } from "next";
import { ComprasClient } from "@/components/modules/compras/ComprasClient";

export const metadata: Metadata = {
  title: "Compras | ERP Full Pro",
};

export default function ComprasPage() {
  return <ComprasClient />;
}

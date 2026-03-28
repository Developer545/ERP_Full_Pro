import type { Metadata } from "next";
import { InventarioClient } from "@/components/modules/inventario/InventarioClient";

export const metadata: Metadata = { title: "Inventario | ERP Full Pro" };

export default function InventarioPage() {
  return <InventarioClient />;
}

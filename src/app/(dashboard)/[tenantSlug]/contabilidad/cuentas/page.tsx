import type { Metadata } from "next";
import { CuentasClient } from "@/components/modules/contabilidad/CuentasClient";

export const metadata: Metadata = {
  title: "Catálogo de Cuentas | ERP Full Pro",
  description: "Plan de cuentas contables PYMES El Salvador",
};

export default function CuentasPage() {
  return <CuentasClient />;
}

import type { Metadata } from "next";
import { PlanillaClient } from "@/components/modules/planilla/PlanillaClient";

export const metadata: Metadata = {
  title: "Planilla | ERP Full Pro",
  description: "Planilla de sueldos y salarios El Salvador — ISSS, AFP, Renta, INSAFORP",
};

interface PlanillaPageProps {
  params: Promise<{ tenantSlug: string }>;
}

/**
 * Pagina del modulo de Planilla SV.
 * Server Component — renderiza el Client Component principal.
 */
export default async function PlanillaPage({ params }: PlanillaPageProps) {
  const { tenantSlug } = await params;
  return <PlanillaClient tenantSlug={tenantSlug} />;
}

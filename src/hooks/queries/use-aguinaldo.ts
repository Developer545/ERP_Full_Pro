"use client";

import { useQuery } from "@tanstack/react-query";
import type { AguinaldoResult } from "@/modules/aguinaldo/aguinaldo.types";

const BASE_URL = "/api/v1/aguinaldo";

export const AGUINALDO_KEY = "aguinaldo";

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchAguinaldo(anio?: number): Promise<AguinaldoResult> {
  const params = new URLSearchParams();
  if (anio) params.set("anio", String(anio));

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener calculo de aguinaldo");
  }

  const json = await res.json();
  return json.data as AguinaldoResult;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener el calculo de aguinaldo de todos los empleados activos.
 */
export function useAguinaldo(anio?: number) {
  return useQuery<AguinaldoResult>({
    queryKey: [AGUINALDO_KEY, anio],
    queryFn: () => fetchAguinaldo(anio),
    staleTime: 60_000, // 1 minuto — cambia poco en el dia
  });
}

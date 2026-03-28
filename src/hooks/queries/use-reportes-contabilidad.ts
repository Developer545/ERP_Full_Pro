"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchJson(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error en la solicitud");
  return json;
}

interface FiltroReporte {
  periodoId?: string;
  desde?: string;
  hasta?: string;
}

export function useBalanceComprobacion(filtros: FiltroReporte, enabled = false) {
  const params = new URLSearchParams();
  if (filtros.periodoId) params.set("periodoId", filtros.periodoId);
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);

  return useQuery({
    queryKey: ["balance-comprobacion", filtros],
    queryFn: () => fetchJson(`/api/v1/contabilidad/balance-comprobacion?${params}`),
    enabled,
    staleTime: 0,
  });
}

export function useLibroMayor(
  filtros: FiltroReporte & { accountId: string },
  enabled = false
) {
  const params = new URLSearchParams();
  params.set("accountId", filtros.accountId);
  if (filtros.periodoId) params.set("periodoId", filtros.periodoId);
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);

  return useQuery({
    queryKey: ["libro-mayor", filtros],
    queryFn: () => fetchJson(`/api/v1/contabilidad/libro-mayor?${params}`),
    enabled: enabled && !!filtros.accountId,
    staleTime: 0,
  });
}

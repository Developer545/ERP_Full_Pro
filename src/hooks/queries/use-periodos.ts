"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PeriodoFiltros } from "@/modules/contabilidad/periodo.types";
import type { CreatePeriodoDto } from "@/modules/contabilidad/periodo.schema";

const BASE = "/api/v1/periodos";
const KEY = "periodos";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error en la solicitud");
  return json;
}

export function usePeriodos(filtros: PeriodoFiltros = {}) {
  const params = new URLSearchParams();
  if (filtros.anio) params.set("anio", String(filtros.anio));
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  return useQuery({
    queryKey: [KEY, filtros],
    queryFn: () => fetchJson(`${BASE}?${params}`),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeriodoDto) =>
      fetchJson(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCerrarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`${BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "cerrar" }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReabrirPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`${BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "reabrir" }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

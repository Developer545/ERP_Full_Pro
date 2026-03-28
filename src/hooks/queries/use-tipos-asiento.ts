"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTipoAsientoDto } from "@/modules/contabilidad/tipo-asiento.schema";

const BASE = "/api/v1/tipos-asiento";
const KEY = "tipos-asiento";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error en la solicitud");
  return json;
}

export function useTiposAsiento() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => fetchJson(BASE),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateTipoAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTipoAsientoDto) =>
      fetchJson(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteTipoAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${BASE}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

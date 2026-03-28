"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AsientoFiltros, CreateAsientoInput, UpdateAsientoInput } from "@/modules/contabilidad/asiento.types";

const KEY = "asientos";
const SALDOS_KEY = "contabilidad-saldos";

async function fetchAsientos(filtros: AsientoFiltros) {
  const params = new URLSearchParams();
  if (filtros.search)  params.set("search", filtros.search);
  if (filtros.estado)  params.set("estado", filtros.estado);
  if (filtros.desde)   params.set("desde", filtros.desde);
  if (filtros.hasta)   params.set("hasta", filtros.hasta);
  if (filtros.origen)  params.set("origen", filtros.origen);
  if (filtros.page)    params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));
  const res = await fetch(`/api/v1/asientos?${params}`);
  if (!res.ok) throw new Error("Error al cargar asientos");
  return res.json();
}

export function useAsientos(filtros: AsientoFiltros = {}) {
  return useQuery({
    queryKey: [KEY, filtros],
    queryFn: () => fetchAsientos(filtros),
  });
}

export function useSaldosCuentas(desde: string, hasta: string, enabled = true) {
  return useQuery({
    queryKey: [SALDOS_KEY, desde, hasta],
    queryFn: async () => {
      const res = await fetch(`/api/v1/contabilidad/saldos?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error("Error al cargar saldos");
      const json = await res.json();
      return json.data as Array<{
        codigo: string; nombre: string; tipo: string; naturaleza: string; debe: number; haber: number;
      }>;
    },
    enabled: enabled && !!desde && !!hasta,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAsientoInput) => {
      const res = await fetch("/api/v1/asientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al crear asiento");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SALDOS_KEY] });
    },
  });
}

export function useUpdateAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAsientoInput }) => {
      const res = await fetch(`/api/v1/asientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al actualizar asiento");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SALDOS_KEY] });
    },
  });
}

export function usePublicarAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/asientos/${id}/publicar`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al publicar asiento");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SALDOS_KEY] });
    },
  });
}

export function useAnularAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/asientos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al anular asiento");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SALDOS_KEY] });
    },
  });
}

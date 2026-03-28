"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GastosFiltros, CreateGastoInput, UpdateGastoInput, CreateCategoriaInput } from "@/modules/gastos/gastos.types";

// ─── Keys ──────────────────────────────────────────────────────────────────

const GASTOS_KEY = "gastos";
const GASTOS_CATS_KEY = "gastos-categorias";
const GASTOS_RESUMEN_KEY = "gastos-resumen";

// ─── Fetchers ──────────────────────────────────────────────────────────────

async function fetchGastos(filtros: GastosFiltros) {
  const params = new URLSearchParams();
  if (filtros.search)        params.set("search", filtros.search);
  if (filtros.categoryId)    params.set("categoryId", filtros.categoryId);
  if (filtros.from)          params.set("from", filtros.from);
  if (filtros.to)            params.set("to", filtros.to);
  if (filtros.paymentMethod) params.set("paymentMethod", filtros.paymentMethod);
  if (filtros.page)          params.set("page", String(filtros.page));
  if (filtros.pageSize)      params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`/api/v1/gastos?${params}`);
  if (!res.ok) throw new Error("Error al cargar gastos");
  return res.json();
}

async function fetchCategorias() {
  const res = await fetch("/api/v1/gastos/categorias");
  if (!res.ok) throw new Error("Error al cargar categorias");
  const json = await res.json();
  return json.data;
}

async function fetchResumen() {
  const res = await fetch("/api/v1/gastos/resumen");
  if (!res.ok) throw new Error("Error al cargar resumen");
  const json = await res.json();
  return json.data;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useGastos(filtros: GastosFiltros = {}) {
  return useQuery({
    queryKey: [GASTOS_KEY, filtros],
    queryFn: () => fetchGastos(filtros),
  });
}

export function useGastosCategorias() {
  return useQuery({
    queryKey: [GASTOS_CATS_KEY],
    queryFn: fetchCategorias,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGastosResumen() {
  return useQuery({
    queryKey: [GASTOS_RESUMEN_KEY],
    queryFn: fetchResumen,
  });
}

export function useCreateGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGastoInput) => {
      const res = await fetch("/api/v1/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al crear gasto");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GASTOS_KEY] });
      qc.invalidateQueries({ queryKey: [GASTOS_RESUMEN_KEY] });
    },
  });
}

export function useUpdateGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGastoInput }) => {
      const res = await fetch(`/api/v1/gastos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al actualizar gasto");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GASTOS_KEY] });
      qc.invalidateQueries({ queryKey: [GASTOS_RESUMEN_KEY] });
    },
  });
}

export function useDeleteGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/gastos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar gasto");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GASTOS_KEY] });
      qc.invalidateQueries({ queryKey: [GASTOS_RESUMEN_KEY] });
    },
  });
}

export function useCreateCategoriaGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoriaInput) => {
      const res = await fetch("/api/v1/gastos/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al crear categoria");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GASTOS_CATS_KEY] });
    },
  });
}

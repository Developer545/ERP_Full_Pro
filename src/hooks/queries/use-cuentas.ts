"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CuentaFiltros, CreateCuentaInput, UpdateCuentaInput } from "@/modules/contabilidad/cuenta.types";

const KEY = "cuentas";

async function fetchCuentas(filtros: CuentaFiltros) {
  const params = new URLSearchParams();
  if (filtros.search)        params.set("search", filtros.search);
  if (filtros.tipo)          params.set("tipo", filtros.tipo);
  if (filtros.soloMovimiento) params.set("soloMovimiento", "true");
  if (filtros.page)          params.set("page", String(filtros.page));
  if (filtros.pageSize)      params.set("pageSize", String(filtros.pageSize));
  const res = await fetch(`/api/v1/cuentas?${params}`);
  if (!res.ok) throw new Error("Error al cargar catálogo de cuentas");
  return res.json();
}

export function useCuentas(filtros: CuentaFiltros = {}) {
  return useQuery({
    queryKey: [KEY, filtros],
    queryFn: () => fetchCuentas(filtros),
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCuentaInput) => {
      const res = await fetch("/api/v1/cuentas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al crear cuenta");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCuentaInput }) => {
      const res = await fetch(`/api/v1/cuentas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al actualizar cuenta");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/cuentas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Error al eliminar cuenta");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useImportarCuentas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData | unknown[]) => {
      let res: Response;
      if (payload instanceof FormData) {
        // Archivo Excel — multipart
        res = await fetch("/api/v1/cuentas/importar", { method: "POST", body: payload });
      } else {
        // JSON directo
        res = await fetch("/api/v1/cuentas/importar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: payload }),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Error al importar");
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useImportarCatalogoEstandar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/cuentas/estandar", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Error al importar catálogo");
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

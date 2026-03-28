"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE_URL = "/api/v1/compras";

export const COMPRAS_KEY = "compras";

// ─── Tipos de filtros ─────────────────────────────────────────────────────────

export interface CompraFiltros {
  search?: string;
  status?: string;
  supplierId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCompras(filtros: Partial<CompraFiltros>) {
  const params = new URLSearchParams();
  if (filtros.search) params.set("search", filtros.search);
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.supplierId) params.set("supplierId", filtros.supplierId);
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener ordenes de compra");
  }
  return res.json();
}

async function fetchCompraById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Orden de compra no encontrada");
  const json = await res.json();
  return json.data;
}

async function createCompra(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear la orden de compra");
  return json.data;
}

async function recibirCompra({
  id,
  items,
}: {
  id: string;
  items: { itemId: string; quantityReceived: number }[];
}) {
  const res = await fetch(`${BASE_URL}/${id}/recibir`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message ?? "Error al registrar la recepcion");
  return json.data;
}

async function cancelCompra(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message ?? "Error al eliminar la orden de compra");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar ordenes de compra con paginacion y filtros.
 */
export function useCompras(filtros: Partial<CompraFiltros> = {}) {
  return useQuery({
    queryKey: [COMPRAS_KEY, filtros],
    queryFn: () => fetchCompras(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener una OC por ID.
 */
export function useCompra(id: string | null) {
  return useQuery({
    queryKey: [COMPRAS_KEY, id],
    queryFn: () => fetchCompraById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/**
 * Hook para crear una nueva OC.
 */
export function useCreateCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPRAS_KEY] });
      toast.success("Orden de compra creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la orden de compra");
    },
  });
}

/**
 * Hook para registrar la recepcion de mercaderia de una OC.
 * Invalida compras, productos e inventario.
 */
export function useRecibirCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recibirCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPRAS_KEY] });
      qc.invalidateQueries({ queryKey: ["productos"] });
      qc.invalidateQueries({ queryKey: ["inventario"] });
      toast.success("Recepcion registrada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar la recepcion");
    },
  });
}

/**
 * Hook para eliminar (soft delete) una OC en estado DRAFT.
 */
export function useCancelCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPRAS_KEY] });
      toast.success("Orden de compra eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la orden de compra");
    },
  });
}

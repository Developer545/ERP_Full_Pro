"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InventarioFiltros, CreateMovementInput } from "@/modules/inventario/inventario.types";

const BASE_URL = "/api/v1/inventario";

export const INVENTARIO_KEY = "inventario";
export const STOCK_KEY = "inventario-stock";
export const KARDEX_KEY = "inventario-kardex";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchMovimientos(filtros: Partial<InventarioFiltros>) {
  const params = new URLSearchParams();
  if (filtros.productId) params.set("productId", filtros.productId);
  if (filtros.type) params.set("type", filtros.type);
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener movimientos");
  }
  return res.json();
}

async function fetchResumenStock() {
  const res = await fetch(`${BASE_URL}/stock`);
  if (!res.ok) throw new Error("Error al obtener resumen de stock");
  const json = await res.json();
  return json.data;
}

async function fetchKardex(productId: string) {
  const res = await fetch(`${BASE_URL}/kardex/${productId}`);
  if (!res.ok) throw new Error("Error al obtener kardex");
  const json = await res.json();
  return json.data;
}

async function createMovimiento(data: Partial<CreateMovementInput>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear movimiento");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar movimientos de inventario con paginacion y filtros.
 */
export function useMovimientos(filtros: Partial<InventarioFiltros> = {}) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, filtros],
    queryFn: () => fetchMovimientos(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener el resumen de stock por producto.
 */
export function useResumenStock() {
  return useQuery({
    queryKey: [STOCK_KEY],
    queryFn: fetchResumenStock,
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener el kardex completo de un producto.
 */
export function useKardex(productId: string | null) {
  return useQuery({
    queryKey: [KARDEX_KEY, productId],
    queryFn: () => fetchKardex(productId!),
    enabled: !!productId,
    staleTime: 30_000,
  });
}

/**
 * Hook para crear un movimiento de inventario (ajuste, entrada, salida).
 */
export function useAjustarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMovimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INVENTARIO_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_KEY] });
      qc.invalidateQueries({ queryKey: [KARDEX_KEY] });
      // Invalidar productos para actualizar stock visible en otros modulos
      qc.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Movimiento de inventario registrado");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el movimiento");
    },
  });
}

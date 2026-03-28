"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FacturaFiltros } from "@/modules/facturas/factura.types";

const BASE_URL = "/api/v1/facturas";

export const FACTURAS_KEY = "facturas";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchFacturas(filtros: Partial<FacturaFiltros>) {
  const params = new URLSearchParams();
  if (filtros.search) params.set("search", filtros.search);
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.tipoDoc) params.set("tipoDoc", filtros.tipoDoc);
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener facturas");
  }
  return res.json();
}

async function fetchFacturaById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Factura no encontrada");
  const json = await res.json();
  return json.data;
}

async function createFactura(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear la factura");
  return json.data;
}

async function cancelFactura(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al cancelar la factura");
  return json.data;
}

async function fetchDTEJson(id: string) {
  const res = await fetch(`${BASE_URL}/${id}/dte`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al obtener el DTE");
  return json;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar facturas con paginacion y filtros.
 */
export function useFacturas(filtros: Partial<FacturaFiltros> = {}) {
  return useQuery({
    queryKey: [FACTURAS_KEY, filtros],
    queryFn: () => fetchFacturas(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener una factura por ID.
 */
export function useFactura(id: string | null) {
  return useQuery({
    queryKey: [FACTURAS_KEY, id],
    queryFn: () => fetchFacturaById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/**
 * Hook para crear una factura nueva.
 */
export function useCreateFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FACTURAS_KEY] });
      toast.success("Factura creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la factura");
    },
  });
}

/**
 * Hook para cancelar una factura (cambia status a CANCELLED).
 */
export function useCancelFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FACTURAS_KEY] });
      toast.success("Factura cancelada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cancelar la factura");
    },
  });
}

/**
 * Hook para obtener el JSON DTE de una factura.
 */
export function useFacturaDTE(id: string | null) {
  return useQuery({
    queryKey: [FACTURAS_KEY, id, "dte"],
    queryFn: () => fetchDTEJson(id!),
    enabled: !!id,
    staleTime: 300_000, // 5 minutos — el JSON DTE no cambia
  });
}

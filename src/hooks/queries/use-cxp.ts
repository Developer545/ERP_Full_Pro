"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CxPFiltros, CreatePagoCxPInput } from "@/modules/cxp/cxp.types";

const BASE_URL = "/api/v1/cxp";

export const CXP_KEY = "cxp";
export const CXP_RESUMEN_KEY = "cxp-resumen";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCxP(filtros: Partial<CxPFiltros>) {
  const params = new URLSearchParams();
  if (filtros.supplierId) params.set("supplierId", filtros.supplierId);
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener cuentas por pagar");
  }
  return res.json();
}

async function fetchCxPById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Cuenta por pagar no encontrada");
  const json = await res.json();
  return json.data;
}

async function fetchResumen() {
  const res = await fetch(`${BASE_URL}/resumen`);
  if (!res.ok) throw new Error("Error al obtener resumen de CxP");
  const json = await res.json();
  return json.data;
}

async function createCxP(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear cuenta por pagar");
  return json.data;
}

async function registrarPago({
  id,
  data,
}: {
  id: string;
  data: CreatePagoCxPInput;
}) {
  const res = await fetch(`${BASE_URL}/${id}/pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al registrar pago");
  return json.data;
}

async function deleteCxP(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar cuenta por pagar");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar cuentas por pagar con filtros y paginacion.
 */
export function useCxP(filtros: Partial<CxPFiltros> = {}) {
  return useQuery({
    queryKey: [CXP_KEY, filtros],
    queryFn: () => fetchCxP(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener una CxP por ID con sus pagos.
 */
export function useCxPById(id: string | null) {
  return useQuery({
    queryKey: [CXP_KEY, id],
    queryFn: () => fetchCxPById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener el resumen de KPIs de CxP.
 */
export function useCxPResumen() {
  return useQuery({
    queryKey: [CXP_RESUMEN_KEY],
    queryFn: fetchResumen,
    staleTime: 60_000,
  });
}

/**
 * Hook para crear una cuenta por pagar.
 */
export function useCreateCxP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCxP,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CXP_KEY] });
      qc.invalidateQueries({ queryKey: [CXP_RESUMEN_KEY] });
      toast.success("Cuenta por pagar creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la cuenta por pagar");
    },
  });
}

/**
 * Hook para registrar un pago en una cuenta por pagar.
 */
export function useRegistrarPagoCxP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registrarPago,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CXP_KEY] });
      qc.invalidateQueries({ queryKey: [CXP_RESUMEN_KEY] });
      toast.success("Pago registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el pago");
    },
  });
}

/**
 * Hook para eliminar una cuenta por pagar.
 */
export function useDeleteCxP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCxP,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CXP_KEY] });
      qc.invalidateQueries({ queryKey: [CXP_RESUMEN_KEY] });
      toast.success("Cuenta por pagar eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la cuenta por pagar");
    },
  });
}

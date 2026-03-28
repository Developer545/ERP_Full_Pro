"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CxCFiltros, CreatePagoInput } from "@/modules/cxc/cxc.types";

const BASE_URL = "/api/v1/cxc";

export const CXC_KEY = "cxc";
export const CXC_RESUMEN_KEY = "cxc-resumen";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCxC(filtros: Partial<CxCFiltros>) {
  const params = new URLSearchParams();
  if (filtros.customerId) params.set("customerId", filtros.customerId);
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener cuentas por cobrar");
  }
  return res.json();
}

async function fetchCxCById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Cuenta por cobrar no encontrada");
  const json = await res.json();
  return json.data;
}

async function fetchResumen() {
  const res = await fetch(`${BASE_URL}/resumen`);
  if (!res.ok) throw new Error("Error al obtener resumen de CxC");
  const json = await res.json();
  return json.data;
}

async function registrarPago({
  id,
  data,
}: {
  id: string;
  data: CreatePagoInput;
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

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar cuentas por cobrar con filtros y paginacion.
 */
export function useCxC(filtros: Partial<CxCFiltros> = {}) {
  return useQuery({
    queryKey: [CXC_KEY, filtros],
    queryFn: () => fetchCxC(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener una CxC por ID con sus pagos.
 */
export function useCxCById(id: string | null) {
  return useQuery({
    queryKey: [CXC_KEY, id],
    queryFn: () => fetchCxCById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener el resumen de KPIs de CxC.
 */
export function useCxCResumen() {
  return useQuery({
    queryKey: [CXC_RESUMEN_KEY],
    queryFn: fetchResumen,
    staleTime: 60_000,
  });
}

/**
 * Hook para registrar un pago en una cuenta por cobrar.
 */
export function useRegistrarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registrarPago,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CXC_KEY] });
      qc.invalidateQueries({ queryKey: [CXC_RESUMEN_KEY] });
      toast.success("Pago registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el pago");
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FiltroPlanilla } from "@/modules/planilla/planilla.types";

const BASE_URL = "/api/v1/planilla";

export const PLANILLA_KEY = "planilla";

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchPlanillas(filtros: FiltroPlanilla = {}) {
  const params = new URLSearchParams();
  if (filtros.mes)      params.set("mes",      String(filtros.mes));
  if (filtros.anio)     params.set("anio",     String(filtros.anio));
  if (filtros.estado)   params.set("estado",   filtros.estado);
  if (filtros.page)     params.set("page",     String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? "Error al obtener planillas");
  }
  return res.json(); // { data, meta }
}

async function fetchPlanillaById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Planilla no encontrada");
  const json = await res.json();
  return json.data;
}

async function generarPlanilla(data: {
  mes: number;
  anio: number;
  ajustes?: unknown[];
}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al generar la planilla");
  return json.data;
}

async function cerrarPlanilla(id: string) {
  const res = await fetch(`${BASE_URL}/${id}/cerrar`, { method: "PUT" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al cerrar la planilla");
  return json.data;
}

async function deletePlanilla(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar la planilla");
  return json.data;
}

async function descargarExcelPlanilla(id: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/${id}/excel`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? "Error al generar el Excel");
  }
  return res.blob();
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Hook para listar planillas del tenant con filtros opcionales.
 */
export function usePlanillas(filtros: FiltroPlanilla = {}) {
  return useQuery({
    queryKey: [PLANILLA_KEY, filtros],
    queryFn: () => fetchPlanillas(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener una planilla por ID con detalles de empleados.
 */
export function usePlanilla(id: string | null) {
  return useQuery({
    queryKey: [PLANILLA_KEY, id],
    queryFn: () => fetchPlanillaById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/**
 * Hook para generar una nueva planilla.
 */
export function useGenerarPlanilla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generarPlanilla,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANILLA_KEY] });
      toast.success("Planilla generada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al generar la planilla");
    },
  });
}

/**
 * Hook para cerrar una planilla (BORRADOR → CERRADA).
 */
export function useCerrarPlanilla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cerrarPlanilla,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANILLA_KEY] });
      toast.success("Planilla cerrada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cerrar la planilla");
    },
  });
}

/**
 * Hook para eliminar (soft delete) una planilla en estado BORRADOR.
 */
export function useDeletePlanilla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePlanilla,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANILLA_KEY] });
      toast.success("Planilla eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la planilla");
    },
  });
}

/**
 * Hook para descargar el Excel de una planilla.
 * Descarga el archivo directamente en el navegador.
 */
export function useDescargarExcelPlanilla() {
  return useMutation({
    mutationFn: async (params: { id: string; periodo: string }) => {
      const blob = await descargarExcelPlanilla(params.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planilla-${params.periodo}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al descargar el Excel");
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE_URL = "/api/v1/configuracion";

export const CONFIGURACION_KEY = "configuracion";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchConfiguracion() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener configuracion");
  }
  const json = await res.json();
  return json.data;
}

async function updateConfiguracion(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al guardar configuracion");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para obtener la configuracion del tenant.
 */
export function useConfiguracion() {
  return useQuery({
    queryKey: [CONFIGURACION_KEY],
    queryFn: fetchConfiguracion,
    staleTime: 60_000,
  });
}

/**
 * Hook para actualizar la configuracion del tenant.
 */
export function useUpdateConfiguracion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateConfiguracion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CONFIGURACION_KEY] });
      toast.success("Configuracion guardada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al guardar la configuracion");
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EmpleadoFiltros } from "@/modules/empleados/empleado.types";
import type { CreateEmpleadoDto, UpdateEmpleadoDto } from "@/modules/empleados/empleado.schema";

const BASE_URL = "/api/v1/empleados";

export const EMPLEADOS_KEY = "empleados";

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchEmpleados(filtros: Partial<EmpleadoFiltros>) {
  const params = new URLSearchParams();
  if (filtros.search) params.set("search", filtros.search);
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.departamento) params.set("departamento", filtros.departamento);
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.pageSize) params.set("pageSize", String(filtros.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener empleados");
  }
  return res.json();
}

async function fetchEmpleado(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener empleado");
  }
  const json = await res.json();
  return json.data;
}

async function fetchEmpleadosActivos() {
  const res = await fetch(`${BASE_URL}/activos`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener empleados activos");
  }
  const json = await res.json();
  return json.data;
}

async function createEmpleado(data: CreateEmpleadoDto) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear empleado");
  return json.data;
}

async function updateEmpleado({
  id,
  data,
}: {
  id: string;
  data: UpdateEmpleadoDto;
}) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar empleado");
  return json.data;
}

async function deleteEmpleado(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar empleado");
  return json.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Hook para listar empleados con paginacion y filtros.
 */
export function useEmpleados(filtros: Partial<EmpleadoFiltros> = {}) {
  return useQuery({
    queryKey: [EMPLEADOS_KEY, filtros],
    queryFn: () => fetchEmpleados(filtros),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener un empleado por ID.
 */
export function useEmpleado(id: string) {
  return useQuery({
    queryKey: [EMPLEADOS_KEY, id],
    queryFn: () => fetchEmpleado(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para listar empleados activos (para selects en planilla, etc).
 */
export function useEmpleadosActivos() {
  return useQuery({
    queryKey: [EMPLEADOS_KEY, "activos"],
    queryFn: fetchEmpleadosActivos,
    staleTime: 60_000,
  });
}

/**
 * Hook para crear un empleado.
 */
export function useCreateEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmpleado,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EMPLEADOS_KEY] });
      toast.success("Empleado creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el empleado");
    },
  });
}

/**
 * Hook para actualizar un empleado.
 */
export function useUpdateEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateEmpleado,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EMPLEADOS_KEY] });
      toast.success("Empleado actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el empleado");
    },
  });
}

/**
 * Hook para eliminar un empleado.
 */
export function useDeleteEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmpleado,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EMPLEADOS_KEY] });
      toast.success("Empleado eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el empleado");
    },
  });
}

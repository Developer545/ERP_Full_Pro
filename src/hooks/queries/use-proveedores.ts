"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterProveedorDto } from "@/modules/proveedores/proveedor.schema";

const BASE_URL = "/api/v1/proveedores";

export const PROVEEDORES_KEY = "proveedores";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchProveedores(filters: Partial<FilterProveedorDto>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener proveedores");
  }
  return res.json();
}

async function createProveedor(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear proveedor");
  return json.data;
}

async function updateProveedor({ id, data }: { id: string; data: unknown }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar proveedor");
  return json.data;
}

async function deleteProveedor(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar proveedor");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar proveedores con paginacion y filtros.
 */
export function useProveedores(filters: Partial<FilterProveedorDto> = {}) {
  return useQuery({
    queryKey: [PROVEEDORES_KEY, filters],
    queryFn: () => fetchProveedores(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook para crear un proveedor.
 */
export function useCreateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROVEEDORES_KEY] });
      toast.success("Proveedor creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el proveedor");
    },
  });
}

/**
 * Hook para actualizar un proveedor.
 */
export function useUpdateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROVEEDORES_KEY] });
      toast.success("Proveedor actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el proveedor");
    },
  });
}

/**
 * Hook para eliminar un proveedor.
 */
export function useDeleteProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROVEEDORES_KEY] });
      toast.success("Proveedor eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el proveedor");
    },
  });
}

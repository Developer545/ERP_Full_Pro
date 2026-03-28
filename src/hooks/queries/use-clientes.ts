"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterClienteDto } from "@/modules/clientes/cliente.schema";

const BASE_URL = "/api/v1/clientes";

export const CLIENTES_KEY = "clientes";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchClientes(filters: Partial<FilterClienteDto>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.docType) params.set("docType", filters.docType);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener clientes");
  }
  return res.json();
}

async function createCliente(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear cliente");
  return json.data;
}

async function updateCliente({ id, data }: { id: string; data: unknown }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar cliente");
  return json.data;
}

async function deleteCliente(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar cliente");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar clientes con paginacion y filtros.
 */
export function useClientes(filters: Partial<FilterClienteDto> = {}) {
  return useQuery({
    queryKey: [CLIENTES_KEY, filters],
    queryFn: () => fetchClientes(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook para crear un cliente.
 */
export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTES_KEY] });
      toast.success("Cliente creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el cliente");
    },
  });
}

/**
 * Hook para actualizar un cliente.
 */
export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTES_KEY] });
      toast.success("Cliente actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el cliente");
    },
  });
}

/**
 * Hook para eliminar un cliente.
 */
export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTES_KEY] });
      toast.success("Cliente eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el cliente");
    },
  });
}

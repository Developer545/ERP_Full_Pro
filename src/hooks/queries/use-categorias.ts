"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterCategoriaDto } from "@/modules/categorias/categoria.schema";

const BASE_URL = "/api/v1/categorias";

/** Clave base para invalidacion */
export const CATEGORIAS_KEY = "categorias";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCategorias(filters: Partial<FilterCategoriaDto>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener categorias");
  }
  return res.json();
}

async function fetchCategoriaById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Categoria no encontrada");
  const json = await res.json();
  return json.data;
}

async function createCategoria(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear categoria");
  return json.data;
}

async function updateCategoria({ id, data }: { id: string; data: unknown }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar categoria");
  return json.data;
}

async function deleteCategoria(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar categoria");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar categorias con paginacion y filtros.
 */
export function useCategorias(filters: Partial<FilterCategoriaDto> = {}) {
  return useQuery({
    queryKey: [CATEGORIAS_KEY, filters],
    queryFn: () => fetchCategorias(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener categorias activas (para selects/dropdowns).
 */
export function useCategoriasActivas() {
  return useQuery({
    queryKey: [CATEGORIAS_KEY, "activas"],
    queryFn: () => fetchCategorias({ isActive: true, pageSize: 100 }),
    staleTime: 60_000,
    select: (data) => data.data as Array<{ id: string; name: string; color?: string }>,
  });
}

/**
 * Hook para obtener una categoria por ID.
 */
export function useCategoriaById(id: string | null) {
  return useQuery({
    queryKey: [CATEGORIAS_KEY, id],
    queryFn: () => fetchCategoriaById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para crear una categoria.
 */
export function useCreateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIAS_KEY] });
      toast.success("Categoria creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la categoria");
    },
  });
}

/**
 * Hook para actualizar una categoria.
 */
export function useUpdateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIAS_KEY] });
      toast.success("Categoria actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la categoria");
    },
  });
}

/**
 * Hook para eliminar una categoria.
 */
export function useDeleteCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIAS_KEY] });
      toast.success("Categoria eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la categoria");
    },
  });
}

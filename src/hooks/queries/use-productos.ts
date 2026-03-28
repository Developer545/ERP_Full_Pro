"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterProductoDto } from "@/modules/productos/producto.schema";

const BASE_URL = "/api/v1/productos";

export const PRODUCTOS_KEY = "productos";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchProductos(filters: Partial<FilterProductoDto>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.lowStock) params.set("lowStock", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener productos");
  }
  return res.json();
}

async function fetchProductoById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  const json = await res.json();
  return json.data;
}

async function createProducto(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear producto");
  return json.data;
}

async function updateProducto({ id, data }: { id: string; data: unknown }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar producto");
  return json.data;
}

async function deleteProducto(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar producto");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar productos con paginacion y filtros.
 */
export function useProductos(filters: Partial<FilterProductoDto> = {}) {
  return useQuery({
    queryKey: [PRODUCTOS_KEY, filters],
    queryFn: () => fetchProductos(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook para obtener un producto por ID.
 */
export function useProductoById(id: string | null) {
  return useQuery({
    queryKey: [PRODUCTOS_KEY, id],
    queryFn: () => fetchProductoById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para crear un producto.
 */
export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
      toast.success("Producto creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el producto");
    },
  });
}

/**
 * Hook para actualizar un producto.
 */
export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
      toast.success("Producto actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el producto");
    },
  });
}

/**
 * Hook para eliminar un producto.
 */
export function useDeleteProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
      toast.success("Producto eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el producto");
    },
  });
}

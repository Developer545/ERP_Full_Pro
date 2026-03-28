"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterUsuarioDto } from "@/modules/usuarios/usuario.schema";

const BASE_URL = "/api/v1/usuarios";

export const USUARIOS_KEY = "usuarios";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchUsuarios(filters: Partial<FilterUsuarioDto>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al obtener usuarios");
  }
  return res.json();
}

async function createUsuario(data: unknown) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al crear usuario");
  return json.data;
}

async function updateUsuario({ id, data }: { id: string; data: unknown }) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al actualizar usuario");
  return json.data;
}

async function deleteUsuario(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al eliminar usuario");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar usuarios.
 */
export function useUsuarios(filters: Partial<FilterUsuarioDto> = {}) {
  return useQuery({
    queryKey: [USUARIOS_KEY, filters],
    queryFn: () => fetchUsuarios(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook para crear un usuario.
 * Retorna { usuario, tempPassword } en data.
 */
export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      // No mostramos toast aqui — el componente mostrara la contrasena temporal
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el usuario");
    },
  });
}

/**
 * Hook para actualizar un usuario.
 */
export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      toast.success("Usuario actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el usuario");
    },
  });
}

/**
 * Hook para eliminar un usuario.
 */
export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      toast.success("Usuario eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el usuario");
    },
  });
}

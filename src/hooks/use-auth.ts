"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook principal de autenticacion.
 * Provee el usuario actual, estado de carga, y funciones de logout.
 *
 * @example
 * const { user, isLoading, logout } = useAuth();
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("No autenticado");
      const json = await res.json();
      return json.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Sesion cerrada");
      router.push("/login");
      router.refresh();
    },
    onError: () => {
      // Forzar redirect aunque falle
      router.push("/login");
    },
  });

  return {
    user: data ?? null,
    tenant: data?.tenant ?? null,
    isLoading,
    isAuthenticated: !isError && !!data,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}

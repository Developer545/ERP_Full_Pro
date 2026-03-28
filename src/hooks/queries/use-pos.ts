"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { POSVentaResult, ProductoPOS } from "@/modules/pos/pos.types";
import type { PosVentaDto } from "@/modules/pos/pos.schema";

// ─── Fetchers ────────────────────────────────────────────────────────────────

/**
 * Busca productos para el POS por nombre, SKU o codigo de barras.
 */
async function fetchProductosPOS(query: string): Promise<ProductoPOS[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());

  const res = await fetch(`/api/v1/pos/productos?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Error al buscar productos");
  }
  const json = await res.json();
  return json.data;
}

/**
 * Procesa la venta enviando los datos al endpoint del POS.
 */
async function procesarVenta(data: PosVentaDto): Promise<POSVentaResult> {
  const res = await fetch("/api/v1/pos/venta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Error al procesar la venta");
  return json.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para buscar productos en el POS con debounce integrado.
 *
 * @param query - Termino de busqueda (nombre, SKU, codigo de barras)
 * @param debounceMs - Milisegundos de espera antes de hacer la busqueda (default: 200)
 */
export function useProductosPOS(query: string, debounceMs = 200) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Aplicar debounce al query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: ["pos-productos", debouncedQuery],
    queryFn: () => fetchProductosPOS(debouncedQuery),
    // Siempre buscar, incluso con query vacio (retorna catalogo completo hasta 20 items)
    staleTime: 30_000,   // 30 segundos — stock puede cambiar
    gcTime: 60_000,      // 1 minuto en cache
  });
}

/**
 * Hook mutation para procesar una venta completa desde el POS.
 * Maneja el estado de carga y errores automaticamente via callbacks del llamador.
 */
export function useProcessVenta() {
  return useMutation<POSVentaResult, Error, PosVentaDto>({
    mutationFn: procesarVenta,
  });
}

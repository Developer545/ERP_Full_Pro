"use client";

import { create } from "zustand";
import type { CartItem, ProductoPOS } from "@/modules/pos/pos.types";

// ─── Helpers de calculo ────────────────────────────────────────────────────────

/**
 * Calcula los campos derivados de un item del carrito.
 * El precio del producto ya incluye IVA, por lo que se extrae el precio sin IVA.
 */
function calcularItem(
  unitPrice: number,
  quantity: number,
  discount: number,
  taxRate: number
): Pick<CartItem, "subtotal" | "ivaAmount" | "total"> {
  // Extraer precio sin IVA (precio incluye IVA)
  const precioSinIva = unitPrice / (1 + taxRate);
  const descuentoMonto = precioSinIva * quantity * (discount / 100);
  const subtotal = parseFloat((precioSinIva * quantity - descuentoMonto).toFixed(2));
  const ivaAmount = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + ivaAmount).toFixed(2));
  return { subtotal, ivaAmount, total };
}

/**
 * Recalcula los totales globales del carrito a partir de sus items.
 */
function calcularTotales(items: CartItem[]): {
  subtotal: number;
  ivaTotal: number;
  total: number;
} {
  const subtotal = parseFloat(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  const ivaTotal = parseFloat(items.reduce((acc, i) => acc + i.ivaAmount, 0).toFixed(2));
  const total = parseFloat(items.reduce((acc, i) => acc + i.total, 0).toFixed(2));
  return { subtotal, ivaTotal, total };
}

// ─── Interface del store ──────────────────────────────────────────────────────

interface POSStore {
  // ── Datos del carrito ──
  items: CartItem[];
  customerId: string | null;
  tipoDoc: "CCF" | "CF";
  paymentMethod: "CASH" | "CARD" | "TRANSFER";
  amountReceived: number;
  notes: string;

  // ── Totales calculados ──
  subtotal: number;     // Sin IVA
  ivaTotal: number;     // IVA 13%
  total: number;        // Total con IVA
  change: number;       // Vuelto al cliente

  // ── Estado de la UI ──
  isProcessing: boolean;

  // ── Acciones del carrito ──
  addItem: (product: ProductoPOS) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  setCustomer: (customerId: string | null) => void;
  setTipoDoc: (tipo: "CCF" | "CF") => void;
  setPaymentMethod: (method: "CASH" | "CARD" | "TRANSFER") => void;
  setAmountReceived: (amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // ── Estado de procesamiento ──
  setProcessing: (v: boolean) => void;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const INITIAL_STATE = {
  items: [] as CartItem[],
  customerId: null,
  tipoDoc: "CF" as const,
  paymentMethod: "CASH" as const,
  amountReceived: 0,
  notes: "",
  subtotal: 0,
  ivaTotal: 0,
  total: 0,
  change: 0,
  isProcessing: false,
};

// ─── Store Zustand ────────────────────────────────────────────────────────────

/**
 * Store del Punto de Venta.
 * Maneja el carrito, calcula totales automaticamente y gestiona el estado de la UI.
 * NO usa persist para evitar datos sensibles en localStorage entre sesiones.
 */
export const usePOSStore = create<POSStore>()((set, get) => ({
  ...INITIAL_STATE,

  // ── Agregar producto al carrito ──
  addItem: (product: ProductoPOS) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.productId === product.id);

    let nuevosItems: CartItem[];

    if (existingIndex >= 0) {
      // Si ya existe, incrementar cantidad en 1
      const existing = items[existingIndex];
      const newQty = existing.quantity + 1;
      const calcs = calcularItem(
        existing.unitPrice,
        newQty,
        existing.discount,
        existing.taxRate
      );
      nuevosItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: newQty, ...calcs }
          : item
      );
    } else {
      // Nuevo item en el carrito
      const taxRate = Number(product.taxRate);
      const unitPrice = Number(product.price);
      const calcs = calcularItem(unitPrice, 1, 0, taxRate);
      const newItem: CartItem = {
        productId: product.id,
        sku: product.sku ?? "",
        name: product.name,
        quantity: 1,
        unitPrice,
        discount: 0,
        taxRate,
        ...calcs,
      };
      nuevosItems = [...items, newItem];
    }

    const totales = calcularTotales(nuevosItems);
    const { paymentMethod, amountReceived } = get();
    const change =
      paymentMethod === "CASH"
        ? Math.max(0, parseFloat((amountReceived - totales.total).toFixed(2)))
        : 0;

    set({ items: nuevosItems, ...totales, change });
  },

  // ── Eliminar item del carrito ──
  removeItem: (productId: string) => {
    const nuevosItems = get().items.filter((i) => i.productId !== productId);
    const totales = calcularTotales(nuevosItems);
    const { paymentMethod, amountReceived } = get();
    const change =
      paymentMethod === "CASH"
        ? Math.max(0, parseFloat((amountReceived - totales.total).toFixed(2)))
        : 0;
    set({ items: nuevosItems, ...totales, change });
  },

  // ── Actualizar cantidad de un item ──
  updateQuantity: (productId: string, qty: number) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    const nuevosItems = get().items.map((item) => {
      if (item.productId !== productId) return item;
      const calcs = calcularItem(item.unitPrice, qty, item.discount, item.taxRate);
      return { ...item, quantity: qty, ...calcs };
    });
    const totales = calcularTotales(nuevosItems);
    const { paymentMethod, amountReceived } = get();
    const change =
      paymentMethod === "CASH"
        ? Math.max(0, parseFloat((amountReceived - totales.total).toFixed(2)))
        : 0;
    set({ items: nuevosItems, ...totales, change });
  },

  // ── Actualizar descuento de un item ──
  updateDiscount: (productId: string, discount: number) => {
    const pct = Math.min(100, Math.max(0, discount));
    const nuevosItems = get().items.map((item) => {
      if (item.productId !== productId) return item;
      const calcs = calcularItem(item.unitPrice, item.quantity, pct, item.taxRate);
      return { ...item, discount: pct, ...calcs };
    });
    const totales = calcularTotales(nuevosItems);
    const { paymentMethod, amountReceived } = get();
    const change =
      paymentMethod === "CASH"
        ? Math.max(0, parseFloat((amountReceived - totales.total).toFixed(2)))
        : 0;
    set({ items: nuevosItems, ...totales, change });
  },

  // ── Setters simples ──
  setCustomer: (customerId) => set({ customerId }),
  setTipoDoc: (tipoDoc) => set({ tipoDoc }),

  setPaymentMethod: (method) => {
    const { total, amountReceived } = get();
    const change =
      method === "CASH"
        ? Math.max(0, parseFloat((amountReceived - total).toFixed(2)))
        : 0;
    set({ paymentMethod: method, change });
  },

  setAmountReceived: (amount) => {
    const { total, paymentMethod } = get();
    const change =
      paymentMethod === "CASH"
        ? Math.max(0, parseFloat((amount - total).toFixed(2)))
        : 0;
    set({ amountReceived: amount, change });
  },

  setNotes: (notes) => set({ notes }),

  // ── Limpiar carrito (nueva venta) ──
  clearCart: () => set({ ...INITIAL_STATE }),

  // ── Estado de procesamiento ──
  setProcessing: (v) => set({ isProcessing: v }),
}));

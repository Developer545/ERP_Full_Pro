"use client";

import { create } from "zustand";

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

/**
 * Store del estado del sidebar (expandido/colapsado).
 */
export const useSidebarStore = create<SidebarStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));

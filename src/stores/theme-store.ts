"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

/**
 * Store de tema (claro/oscuro).
 * Persiste en localStorage para recordar preferencia del usuario.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (dark) => set({ isDark: dark }),
    }),
    {
      name: "erp-theme",
    }
  )
);

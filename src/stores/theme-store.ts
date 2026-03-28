"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME_ID } from "@/config/themes";

interface ThemeStore {
  themeId: string;
  customColor: string;
  /** @deprecated usar themeId + getThemeById().isDark */
  isDark: boolean;
  setThemeId: (id: string) => void;
  setCustomColor: (color: string) => void;
  toggle: () => void;
}

/**
 * Store de tema — persiste themeId + customColor en localStorage.
 * Compatible con el sistema de temas de DeskERP.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      customColor: "",
      isDark: false,

      setThemeId: (id) => {
        // isDark se calcula dinámicamente en el AntdProvider
        set({ themeId: id });
      },

      setCustomColor: (color) => set({ customColor: color }),

      // Compatibilidad hacia atrás — alterna entre orange dark/light
      toggle: () => {
        const current = get().themeId;
        const next =
          current === "speeddansys-orange"
            ? "speeddansys-orange-light"
            : "speeddansys-orange";
        set({ themeId: next });
      },
    }),
    {
      name: "erp-theme",
    }
  )
);

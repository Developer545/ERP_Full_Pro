"use client";

import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";
import {
  getThemeById,
  buildAntThemeConfig,
  applyThemeCSSVars,
  DEFAULT_THEME_ID,
} from "@/config/themes";

/**
 * Proveedor de Ant Design con sistema de temas completo.
 * Sincronizado con useThemeStore (themeId + customColor).
 * Aplica CSS vars + ThemeConfig de Ant Design dinámicamente.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { themeId, customColor } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch en Next.js
  useEffect(() => setMounted(true), []);

  const activeThemeId = mounted ? themeId : DEFAULT_THEME_ID;
  const activeColor = mounted ? customColor : "";
  const appTheme = getThemeById(activeThemeId);
  const antConfig = buildAntThemeConfig(appTheme, activeColor);

  // Aplicar CSS vars al :root cada vez que cambia el tema
  useEffect(() => {
    if (mounted) {
      applyThemeCSSVars(appTheme, activeColor);
    }
  }, [mounted, appTheme, activeColor]);

  return (
    <ConfigProvider theme={antConfig} locale={esES}>
      {children}
    </ConfigProvider>
  );
}

"use client";

import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";
import {
  getThemeById,
  buildAntThemeConfig,
  applyThemeCSSVars,
} from "@/config/themes";

/**
 * Proveedor de Ant Design con sistema de temas completo.
 * Sincronizado con useThemeStore (themeId + customColor).
 * Aplica CSS vars al :root + ThemeConfig de Ant Design dinámicamente.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { themeId, customColor } = useThemeStore();

  const appTheme = getThemeById(themeId);
  const antConfig = buildAntThemeConfig(appTheme, customColor);

  // Aplicar variables CSS al :root cada vez que cambia el tema
  useEffect(() => {
    applyThemeCSSVars(appTheme, customColor);
  }, [appTheme, customColor]);

  return (
    <ConfigProvider theme={antConfig} locale={esES}>
      {children}
    </ConfigProvider>
  );
}

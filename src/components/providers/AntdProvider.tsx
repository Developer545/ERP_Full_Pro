"use client";

import { ConfigProvider, theme as antTheme } from "antd";
import esES from "antd/locale/es_ES";
import { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "@/config/theme";

/**
 * Proveedor de Ant Design con soporte de tema light/dark.
 * Debe envolver toda la app para que los componentes hereden el tema.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detectar preferencia del sistema o guardada en localStorage
    const saved = localStorage.getItem("theme-preference");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (saved === "light") {
      setIsDark(false);
    } else {
      // Sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      if (prefersDark) document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const currentTheme = isDark
    ? { ...darkTheme, algorithm: antTheme.darkAlgorithm }
    : lightTheme;

  return (
    <ConfigProvider theme={currentTheme} locale={esES}>
      {children}
    </ConfigProvider>
  );
}

"use client";

import type { ReactNode } from "react";
import { useSidebarStore } from "@/stores/sidebar-store";

interface DashboardClientWrapperProps {
  children: ReactNode;
  tenantSlug: string;
}

/**
 * Wrapper client-side para el contenido del dashboard.
 *
 * Aplica margin-left dinamico para compensar el sidebar fijo.
 * El sidebar usa position: fixed, por lo que no esta en el flow
 * y el contenido debe empujarse manualmente.
 *
 * Separado del Server Component layout para poder acceder
 * al store Zustand (useSidebarStore).
 */
export function DashboardClientWrapper({
  children,
  tenantSlug: _tenantSlug,
}: DashboardClientWrapperProps) {
  const { collapsed } = useSidebarStore();
  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div
      style={{
        marginLeft: sidebarWidth,
        transition: "margin-left 0.2s",
        minHeight: "100vh",
        // Background hereda del tema Ant Design via ConfigProvider
      }}
    >
      {children}
    </div>
  );
}

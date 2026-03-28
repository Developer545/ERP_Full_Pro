import type { ReactNode } from "react";
import { AppSidebar, AppHeader, AppBreadcrumb } from "@/components/layout";
import { DashboardClientWrapper } from "@/components/layout/DashboardClientWrapper";

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

/**
 * Layout del dashboard con sidebar + header.
 *
 * Estructura final (sidebar es fixed, no ocupa espacio en flow):
 *
 * AppSidebar (position: fixed, left: 0) — NO esta en el flow
 * DashboardClientWrapper (margin-left dinamico = ancho del sidebar)
 *   └── Layout
 *       ├── AppHeader (position: fixed, left = sidebarWidth)
 *       └── Content (margin-top = 64px para el header)
 *           ├── AppBreadcrumb
 *           └── {children}
 */
export default async function TenantDashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { tenantSlug } = await params;

  return (
    <>
      {/* Sidebar fijo — no ocupa espacio en el flujo del documento */}
      <AppSidebar tenantSlug={tenantSlug} />

      {/* Contenido principal — tiene margin-left dinamico segun el sidebar */}
      <DashboardClientWrapper tenantSlug={tenantSlug}>
        <AppHeader tenantSlug={tenantSlug} />

        {/* Padding-top = altura del header (64px) */}
        <main style={{ paddingTop: 64, minHeight: "100vh" }}>
          <div style={{ padding: "16px 24px" }}>
            <div style={{ marginBottom: 16 }}>
              <AppBreadcrumb tenantSlug={tenantSlug} />
            </div>
            {children}
          </div>
        </main>
      </DashboardClientWrapper>
    </>
  );
}

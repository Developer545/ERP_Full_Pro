import type { ReactNode } from "react";

/**
 * Layout raiz del dashboard.
 * El layout especifico (con sidebar + header) se define en [tenantSlug]/layout.tsx
 * para tener acceso al tenantSlug desde los params.
 *
 * Este layout actua como wrapper para la ruta (dashboard).
 */
export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

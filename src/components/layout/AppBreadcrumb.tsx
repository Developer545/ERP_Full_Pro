"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { MENU_ITEMS, type MenuItemConfig } from "@/config/menu";

interface AppBreadcrumbProps {
  tenantSlug: string;
}

/** Mapeo de segmento de ruta a etiqueta legible */
function buildLabelMap(
  items: MenuItemConfig[],
  map: Record<string, string> = {}
): Record<string, string> {
  for (const item of items) {
    map[item.key] = item.label;
    if (item.children) {
      buildLabelMap(item.children, map);
    }
  }
  return map;
}

/**
 * Breadcrumb dinamico basado en la ruta actual.
 * Genera automaticamente los items a partir de MENU_ITEMS.
 *
 * Ejemplo: /mi-empresa/productos → Home > Inventario > Productos
 */
export function AppBreadcrumb({ tenantSlug }: AppBreadcrumbProps) {
  const pathname = usePathname();

  const labelMap = useMemo(() => buildLabelMap(MENU_ITEMS), []);

  const items = useMemo(() => {
    const basePath = `/${tenantSlug}`;
    const relative = pathname.startsWith(basePath)
      ? pathname.slice(basePath.length)
      : pathname;

    const segments = relative.split("/").filter(Boolean);

    const breadcrumbItems = [
      {
        key: "home",
        title: (
          <Link href={`/${tenantSlug}/dashboard`}>
            <HomeOutlined />
          </Link>
        ),
      },
    ];

    // Construir path acumulativo para cada segmento
    let accumulated = "";
    for (const segment of segments) {
      accumulated += `/${segment}`;
      const key = accumulated;
      const label = labelMap[key] ?? capitalize(segment.replace(/-/g, " "));

      breadcrumbItems.push({
        key,
        title: (
          <Link href={`/${tenantSlug}${key}`}>{label}</Link>
        ),
      });
    }

    return breadcrumbItems;
  }, [pathname, tenantSlug, labelMap]);

  return (
    <Breadcrumb
      items={items}
      style={{ fontSize: 13 }}
    />
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

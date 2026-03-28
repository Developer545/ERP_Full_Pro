"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  AccountBookOutlined,
  InboxOutlined,
  TagOutlined,
  BarChartOutlined,
  ImportOutlined,
  FileAddOutlined,
  TeamOutlined,
  CreditCardOutlined,
  UserOutlined,
  ContactsOutlined,
  WalletOutlined,
  IdcardOutlined,
  CalculatorOutlined,
  AuditOutlined,
  OrderedListOutlined,
  EditOutlined,
  BookOutlined,
  LineChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSidebarStore } from "@/stores/sidebar-store";
import { MENU_ITEMS, type MenuItemConfig } from "@/config/menu";
import { APP_NAME } from "@/config/constants";

const { Sider } = Layout;

/** Mapa de nombre de icono a componente */
const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  AccountBookOutlined: <AccountBookOutlined />,
  InboxOutlined: <InboxOutlined />,
  TagOutlined: <TagOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  ImportOutlined: <ImportOutlined />,
  FileAddOutlined: <FileAddOutlined />,
  TeamOutlined: <TeamOutlined />,
  CreditCardOutlined: <CreditCardOutlined />,
  UserOutlined: <UserOutlined />,
  ContactsOutlined: <ContactsOutlined />,
  WalletOutlined: <WalletOutlined />,
  IdcardOutlined: <IdcardOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  AuditOutlined: <AuditOutlined />,
  OrderedListOutlined: <OrderedListOutlined />,
  EditOutlined: <EditOutlined />,
  BookOutlined: <BookOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  SettingOutlined: <SettingOutlined />,
};

interface AppSidebarProps {
  tenantSlug: string;
}

/**
 * Sidebar principal del ERP.
 * - Menu colapsable con iconos
 * - Resalta el item activo segun la URL
 * - Navega usando Next.js router
 */
export function AppSidebar({ tenantSlug }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSidebarStore();

  /** Convierte MenuItemConfig[] a formato que acepta Ant Design Menu */
  const buildMenuItems = useCallback(
    (items: MenuItemConfig[]): MenuProps["items"] => {
      return items.map((item) => {
        const icon = item.icon ? ICON_MAP[item.icon] : undefined;

        if (item.children) {
          return {
            key: item.key,
            label: item.label,
            icon,
            children: buildMenuItems(item.children),
          };
        }

        return {
          key: item.key,
          label: item.label,
          icon,
        };
      });
    },
    []
  );

  const menuItems = useMemo(() => buildMenuItems(MENU_ITEMS), [buildMenuItems]);

  /** Extrae el segmento de ruta relativo al tenant para comparar con menu keys */
  const activeKey = useMemo(() => {
    const basePath = `/${tenantSlug}`;
    if (!pathname.startsWith(basePath)) return "/dashboard";
    const relative = pathname.slice(basePath.length) || "/dashboard";
    return relative;
  }, [pathname, tenantSlug]);

  /** Abre automaticamente el submenu padre del item activo */
  const defaultOpenKeys = useMemo(() => {
    const parentKeys: string[] = [];
    for (const item of MENU_ITEMS) {
      if (item.children) {
        const hasActive = item.children.some((child) =>
          activeKey.startsWith(child.key)
        );
        if (hasActive) parentKeys.push(item.key);
      }
    }
    return parentKeys;
  }, [activeKey]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    router.push(`/${tenantSlug}${key}`);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={220}
      collapsedWidth={64}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: "auto",
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "#1677ff",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          E
        </div>
        {!collapsed && (
          <span
            style={{
              marginLeft: 10,
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              whiteSpace: "nowrap",
            }}
          >
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
}

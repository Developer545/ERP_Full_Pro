"use client";

import { Layout, Button, Avatar, Dropdown, Badge, Space, Typography, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/stores/theme-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuth } from "@/hooks/use-auth";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  tenantSlug: string;
}

/**
 * Header principal del ERP.
 * - Toggle del sidebar
 * - Toggle de tema claro/oscuro
 * - Notificaciones (placeholder)
 * - Menu de usuario con logout
 */
export function AppHeader({ tenantSlug: _tenantSlug }: AppHeaderProps) {
  const { collapsed, toggle } = useSidebarStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const sidebarWidth = collapsed ? 64 : 220;
  const { user, logout, isLoggingOut } = useAuth();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "perfil",
      label: (
        <Space direction="vertical" size={0} style={{ padding: "4px 0" }}>
          <Text strong style={{ fontSize: 13 }}>{user?.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
        </Space>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "configuracion",
      icon: <SettingOutlined />,
      label: "Configuracion",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion",
      danger: true,
      disabled: isLoggingOut,
      onClick: logout,
    },
  ];

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        zIndex: 99,
        height: 64,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        transition: "left 0.2s",
        // Background se hereda del tema Ant Design (Layout.headerBg)
      }}
    >
      {/* Izquierda: toggle sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggle}
        style={{ fontSize: 18 }}
      />

      {/* Derecha: acciones */}
      <Space size={8}>
        {/* Toggle tema */}
        <Tooltip title={isDark ? "Modo claro" : "Modo oscuro"}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ fontSize: 16 }}
          />
        </Tooltip>

        {/* Notificaciones */}
        <Tooltip title="Notificaciones">
          <Badge count={0} dot>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: 16 }}
            />
          </Badge>
        </Tooltip>

        {/* Avatar usuario */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="text" style={{ padding: "0 4px", height: "auto" }}>
            <Space size={8}>
              <Avatar
                size={32}
                src={user?.avatar}
                icon={!user?.avatar ? <UserOutlined /> : undefined}
                style={{ backgroundColor: "#1677ff", cursor: "pointer" }}
              />
              <Text strong style={{ fontSize: 13 }}>
                {user?.name?.split(" ")[0] ?? "Usuario"}
              </Text>
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
}

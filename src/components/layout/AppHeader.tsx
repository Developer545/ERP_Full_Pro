"use client";

import { Layout, Button, Avatar, Dropdown, Badge, Space, Typography, Tooltip, Tag } from "antd";
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

/** Colores de avatar deterministas por inicial */
const AVATAR_COLORS = [
  "#1677ff", "#52c41a", "#fa8c16", "#722ed1",
  "#eb2f96", "#13c2c2", "#fadb14", "#f5222d",
];

function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/** Genera iniciales a partir del nombre */
function getUserInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Color del badge del plan */
const PLAN_COLORS: Record<string, string> = {
  FREE: "default",
  BASIC: "blue",
  PRO: "purple",
  ENTERPRISE: "gold",
};

/**
 * Header principal del ERP.
 * - Toggle del sidebar
 * - Toggle de tema claro/oscuro
 * - Badge del plan del tenant
 * - Notificaciones (placeholder)
 * - Menu de usuario con logout
 */
export function AppHeader({ tenantSlug: _tenantSlug }: AppHeaderProps) {
  const { collapsed, toggle } = useSidebarStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const sidebarWidth = collapsed ? 64 : 220;
  const { user, tenant, logout, isLoggingOut } = useAuth();

  const userInitials = getUserInitials(user?.name);
  const avatarColor = getAvatarColor(user?.name);
  const plan = (tenant?.plan as string | undefined) ?? "FREE";

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
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(10px)",
        transition: "left 0.2s",
        // Background se hereda del tema Ant Design (Layout.headerBg)
      }}
    >
      {/* Izquierda: toggle sidebar + nombre del tenant y plan */}
      <Space size={12} align="center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          style={{ fontSize: 18 }}
        />
        {tenant?.name && (
          <Space size={8} align="center">
            <Text strong style={{ fontSize: 14 }}>
              {tenant.name}
            </Text>
            <Tag
              color={PLAN_COLORS[plan] ?? "default"}
              style={{ borderRadius: 12, fontSize: 10, lineHeight: "18px", padding: "0 8px", margin: 0 }}
            >
              {plan}
            </Tag>
          </Space>
        )}
      </Space>

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
                icon={!user?.avatar && !user?.name ? <UserOutlined /> : undefined}
                style={{ backgroundColor: avatarColor, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                {!user?.avatar ? userInitials : undefined}
              </Avatar>
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

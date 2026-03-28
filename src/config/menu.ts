import type { MenuProps } from "antd";

export type MenuItem = Required<MenuProps>["items"][number];

/**
 * Configuracion del menu lateral del ERP.
 * Los items se construyen dinamicamente usando el tenantSlug de la URL.
 * Cada item tiene un key que corresponde a la ruta relativa al tenant.
 */
export interface MenuItemConfig {
  key: string;          // Ruta: "/dashboard", "/pos", etc.
  label: string;        // Texto visible
  icon?: string;        // Nombre del icono (se resuelve en el componente)
  children?: MenuItemConfig[];
  requiredRole?: string; // Rol minimo requerido para ver el item
  requiredFeature?: string; // Feature flag requerido
  badge?: "new" | "beta";
}

export const MENU_ITEMS: MenuItemConfig[] = [
  {
    key: "/dashboard",
    label: "Dashboard",
    icon: "DashboardOutlined",
  },
  {
    key: "/pos",
    label: "Punto de Venta",
    icon: "ShoppingCartOutlined",
    requiredFeature: "pos",
  },
  {
    key: "ventas",
    label: "Ventas",
    icon: "ShoppingOutlined",
    children: [
      { key: "/facturas", label: "Facturas DTE", icon: "FileTextOutlined", requiredFeature: "dte" },
      { key: "/cxc", label: "Cuentas por Cobrar", icon: "AccountBookOutlined" },
    ],
  },
  {
    key: "inventario",
    label: "Inventario",
    icon: "InboxOutlined",
    children: [
      { key: "/categorias", label: "Categorias", icon: "TagOutlined" },
      { key: "/productos", label: "Productos", icon: "ShoppingOutlined" },
      { key: "/inventario", label: "Kardex / Existencias", icon: "BarChartOutlined" },
    ],
  },
  {
    key: "compras",
    label: "Compras",
    icon: "ImportOutlined",
    children: [
      { key: "/compras", label: "Ordenes de Compra", icon: "FileAddOutlined" },
      { key: "/proveedores", label: "Proveedores", icon: "TeamOutlined" },
      { key: "/cxp", label: "Cuentas por Pagar", icon: "CreditCardOutlined" },
    ],
  },
  {
    key: "clientes-menu",
    label: "Clientes",
    icon: "UserOutlined",
    children: [
      { key: "/clientes", label: "Directorio", icon: "ContactsOutlined" },
      { key: "/gastos", label: "Gastos", icon: "WalletOutlined" },
    ],
  },
  {
    key: "rrhh",
    label: "RRHH",
    icon: "IdcardOutlined",
    requiredFeature: "planilla",
    children: [
      { key: "/empleados", label: "Empleados", icon: "TeamOutlined" },
      { key: "/planilla", label: "Planilla", icon: "CalculatorOutlined" },
      { key: "/aguinaldo", label: "Aguinaldo", icon: "GiftOutlined" },
    ],
  },
  {
    key: "contabilidad",
    label: "Contabilidad",
    icon: "AuditOutlined",
    requiredFeature: "contabilidad",
    children: [
      { key: "/contabilidad/cuentas", label: "Catalogo de Cuentas", icon: "OrderedListOutlined" },
      { key: "/contabilidad/asientos", label: "Asientos", icon: "EditOutlined" },
      { key: "/contabilidad/libros", label: "Libros", icon: "BookOutlined" },
      { key: "/contabilidad/estados", label: "Estados Financieros", icon: "LineChartOutlined" },
    ],
  },
  {
    key: "/reportes",
    label: "Reportes",
    icon: "BarChartOutlined",
  },
  {
    key: "/usuarios",
    label: "Usuarios",
    icon: "UserOutlined",
    requiredRole: "ADMIN",
  },
  {
    key: "/configuracion",
    label: "Configuracion",
    icon: "SettingOutlined",
    requiredRole: "ADMIN",
  },
];

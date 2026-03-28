import type { ThemeConfig } from "antd";

/**
 * Tokens base compartidos entre temas
 */
const baseTokens = {
  borderRadius: 10,
  borderRadiusLG: 12,
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 14,
  colorPrimary: "#1677ff",
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#ff4d4f",
};

/**
 * Tema claro (default)
 */
export const lightTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorBgElevated: "#ffffff",
    colorBorder: "#e8e8e8",
    colorText: "rgba(0,0,0,0.88)",
    colorTextSecondary: "rgba(0,0,0,0.45)",
  },
  components: {
    Table: {
      // size se aplica como prop en cada <Table size="small" />, no como token
      headerBg: "#fafafa",
      rowHoverBg: "#f5f5f5",
      borderColor: "#e8e8e8",
    },
    Card: {
      // size se aplica como prop en cada <Card size="small" />, no como token
      paddingLG: 16,
    },
    Button: {
      controlHeight: 36,
    },
    Form: {
      itemMarginBottom: 16,
    },
    Input: {
      controlHeight: 36,
    },
    Select: {
      controlHeight: 36,
    },
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#001529",
      triggerBg: "#002140",
    },
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
      darkItemSelectedBg: "#1677ff",
    },
  },
};

/**
 * Tema oscuro
 */
export const darkTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgContainer: "#161b22",
    colorBgLayout: "#0d1117",
    colorBgElevated: "#1c2128",
    colorBorder: "#30363d",
    colorText: "rgba(255,255,255,0.88)",
    colorTextSecondary: "rgba(255,255,255,0.45)",
  },
  components: {
    Table: {
      // size se aplica como prop en cada <Table size="small" />, no como token
      headerBg: "#1c2128",
      rowHoverBg: "#1c2128",
      borderColor: "#30363d",
    },
    Card: {
      // size se aplica como prop en cada <Card size="small" />, no como token
      paddingLG: 16,
    },
    Button: {
      controlHeight: 36,
    },
    Form: {
      itemMarginBottom: 16,
    },
    Input: {
      controlHeight: 36,
    },
    Select: {
      controlHeight: 36,
    },
    Layout: {
      headerBg: "#161b22",
      siderBg: "#0d1117",
      triggerBg: "#0d1117",
    },
    Menu: {
      darkItemBg: "#0d1117",
      darkSubMenuItemBg: "#000000",
      darkItemSelectedBg: "#1677ff",
    },
  },
};

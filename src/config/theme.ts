import type { ThemeConfig } from "antd";
import { PALETTE } from "./palette";

/**
 * Tokens base compartidos entre temas.
 * Todos los colores leen de PALETTE — editar palette.ts para cambiar la paleta.
 */
const baseTokens = {
  borderRadius: 10,
  borderRadiusLG: 12,
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 14,
  colorPrimary:  PALETTE.primary,
  colorSuccess:  PALETTE.success,
  colorWarning:  PALETTE.warning,
  colorError:    PALETTE.error,
};

/**
 * Tema claro (default)
 */
export const lightTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgContainer:    PALETTE.bgContainer,
    colorBgLayout:       PALETTE.bgLayout,
    colorBgElevated:     PALETTE.bgElevated,
    colorBorder:         PALETTE.border,
    colorText:           PALETTE.textPrimary,
    colorTextSecondary:  PALETTE.textSecondary,
  },
  components: {
    Table: {
      headerBg:    "#fafafa",
      rowHoverBg:  "#f5f5f5",
      borderColor: PALETTE.border,
    },
    Card: {
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
      headerBg:  PALETTE.bgContainer,
      siderBg:   "#111111",
      triggerBg: "#0a0a0a",
    },
    Menu: {
      darkItemBg:         "#111111",
      darkSubMenuItemBg:  "#0a0a0a",
      darkItemSelectedBg: "rgba(244,121,32,0.15)",
    },
  },
};

/**
 * Tema oscuro
 */
export const darkTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgContainer:    PALETTE.darkBgContainer,
    colorBgLayout:       PALETTE.darkBgLayout,
    colorBgElevated:     PALETTE.darkBgElevated,
    colorBorder:         PALETTE.darkBorder,
    colorText:           PALETTE.darkText,
    colorTextSecondary:  PALETTE.darkTextSec,
  },
  components: {
    Table: {
      headerBg:    PALETTE.darkBgElevated,
      rowHoverBg:  PALETTE.darkBgElevated,
      borderColor: PALETTE.darkBorder,
    },
    Card: {
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
      headerBg:  PALETTE.darkBgContainer,
      siderBg:   PALETTE.darkBgLayout,
      triggerBg: PALETTE.darkBgLayout,
    },
    Menu: {
      darkItemBg:         PALETTE.darkBgLayout,
      darkSubMenuItemBg:  "#000000",
      darkItemSelectedBg: PALETTE.primary,
    },
  },
};

/**
 * PALETA DE COLORES — ERP Full Pro
 * ─────────────────────────────────────────────────────────────────────────────
 * Este es el ÚNICO lugar donde se definen los colores de la aplicacion.
 *
 * Para cambiar la paleta completa solo edita este archivo.
 * Todos los componentes, el tema Ant Design y las variables CSS
 * leen desde aqui.
 *
 * Uso en componentes:
 *   import { PALETTE } from "@/config/palette";
 *   style={{ color: PALETTE.primary }}
 *
 * Uso en CSS:
 *   color: var(--color-primary);
 */

// ─── Color primario ───────────────────────────────────────────────────────────
// Cambiar aqui para repintar toda la UI de un solo tiro.
const PRIMARY           = "#d4a017"; // Dorado / Amber profesional
const PRIMARY_HOVER     = "#b8880f"; // Tono mas oscuro para hover
const PRIMARY_LIGHT     = "#fdf6e3"; // Fondo claro para iconos/badges
const PRIMARY_DARK      = "#a07510"; // Para modo oscuro

// ─── Colores semanticos ───────────────────────────────────────────────────────
const SUCCESS           = "#52c41a";
const SUCCESS_LIGHT     = "#f6ffed";
const WARNING           = "#faad14";
const WARNING_LIGHT     = "#fffbe6";
const ERROR             = "#ff4d4f";
const ERROR_LIGHT       = "#fff1f0";
const INFO              = "#1677ff";
const INFO_LIGHT        = "#e6f4ff";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SIDEBAR_BG_FROM   = "#1a1a2e"; // Top del gradiente
const SIDEBAR_BG_MID    = "#16213e"; // Medio
const SIDEBAR_BG_TO     = "#0f3460"; // Bottom del gradiente
const SIDEBAR_GRADIENT  = `linear-gradient(180deg, ${SIDEBAR_BG_FROM} 0%, ${SIDEBAR_BG_MID} 50%, ${SIDEBAR_BG_TO} 100%)`;

// Logo del sidebar — puede ser mono, duo o tricolor
const LOGO_GRADIENT     = `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`;

// ─── Colores de avatar (ciclo para usuarios sin foto) ─────────────────────────
const AVATAR_COLORS     = ["#d4a017", "#52c41a", "#1677ff", "#722ed1", "#fa8c16", "#eb2f96"];

// ─── Neutrales — Modo claro ───────────────────────────────────────────────────
const BG_LAYOUT         = "#f5f5f5";
const BG_CONTAINER      = "#ffffff";
const BG_ELEVATED       = "#ffffff";
const BORDER            = "#e8e8e8";
const TEXT_PRIMARY      = "rgba(0,0,0,0.88)";
const TEXT_SECONDARY    = "rgba(0,0,0,0.45)";

// ─── Neutrales — Modo oscuro ──────────────────────────────────────────────────
const DARK_BG_LAYOUT    = "#0d1117";
const DARK_BG_CONTAINER = "#161b22";
const DARK_BG_ELEVATED  = "#1c2128";
const DARK_BORDER       = "#30363d";
const DARK_TEXT         = "rgba(255,255,255,0.88)";
const DARK_TEXT_SEC     = "rgba(255,255,255,0.45)";

// ─── Export ───────────────────────────────────────────────────────────────────

/** Paleta completa — importar en components, theme.ts, etc. */
export const PALETTE = {
  // Primario
  primary:        PRIMARY,
  primaryHover:   PRIMARY_HOVER,
  primaryLight:   PRIMARY_LIGHT,
  primaryDark:    PRIMARY_DARK,

  // Semanticos
  success:        SUCCESS,
  successLight:   SUCCESS_LIGHT,
  warning:        WARNING,
  warningLight:   WARNING_LIGHT,
  error:          ERROR,
  errorLight:     ERROR_LIGHT,
  info:           INFO,
  infoLight:      INFO_LIGHT,

  // Sidebar
  sidebarGradient: SIDEBAR_GRADIENT,
  logoGradient:    LOGO_GRADIENT,

  // Avatares
  avatarColors:   AVATAR_COLORS,

  // Neutrales light
  bgLayout:       BG_LAYOUT,
  bgContainer:    BG_CONTAINER,
  bgElevated:     BG_ELEVATED,
  border:         BORDER,
  textPrimary:    TEXT_PRIMARY,
  textSecondary:  TEXT_SECONDARY,

  // Neutrales dark
  darkBgLayout:    DARK_BG_LAYOUT,
  darkBgContainer: DARK_BG_CONTAINER,
  darkBgElevated:  DARK_BG_ELEVATED,
  darkBorder:      DARK_BORDER,
  darkText:        DARK_TEXT,
  darkTextSec:     DARK_TEXT_SEC,
} as const;

/** Atajos tipados para los colores mas usados en KPICards/Dashboards */
export const COLOR = {
  primary:  PRIMARY,
  success:  SUCCESS,
  warning:  WARNING,
  error:    ERROR,
  info:     INFO,
  purple:   "#722ed1",
  orange:   "#fa8c16",
  cyan:     "#13c2c2",
  magenta:  "#eb2f96",
} as const;

/** Fondos de icono para KPI cards (par icono/fondo) */
export const ICON_BG = {
  primary:  { color: PRIMARY,   bg: PRIMARY_LIGHT   },
  success:  { color: SUCCESS,   bg: SUCCESS_LIGHT   },
  warning:  { color: WARNING,   bg: WARNING_LIGHT   },
  error:    { color: ERROR,     bg: ERROR_LIGHT     },
  info:     { color: INFO,      bg: INFO_LIGHT      },
  purple:   { color: "#722ed1", bg: "#f9f0ff"       },
  orange:   { color: "#fa8c16", bg: "#fff7e6"       },
} as const;

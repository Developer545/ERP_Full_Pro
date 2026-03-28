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
// ✏️  CAMBIAR AQUI para repintar toda la UI de un solo tiro.
//
// Paleta activa: Orange Professional (naranja sutil — ERP empresarial)
// Otras opciones comentadas para cambio rapido:
//   Emerald: PRIMARY = "#059669"  HOVER = "#047857"  LIGHT = "#ecfdf5"
//   Violet:  PRIMARY = "#7c3aed"  HOVER = "#6d28d9"  LIGHT = "#f5f3ff"
//   Teal:    PRIMARY = "#0891b2"  HOVER = "#0e7490"  LIGHT = "#ecfeff"
//   Rose:    PRIMARY = "#e11d48"  HOVER = "#be123c"  LIGHT = "#fff1f2"
const PRIMARY           = "#ea580c"; // Orange 600 — naranja profesional
const PRIMARY_HOVER     = "#c2410c"; // Orange 700 — hover mas oscuro
const PRIMARY_LIGHT     = "#fff7ed"; // Orange 50  — fondo suave para iconos/badges
const PRIMARY_DARK      = "#9a3412"; // Orange 800 — modo oscuro

// ─── Colores semanticos ───────────────────────────────────────────────────────
const SUCCESS           = "#16a34a"; // Green 600
const SUCCESS_LIGHT     = "#f0fdf4";
const WARNING           = "#d97706"; // Amber 600
const WARNING_LIGHT     = "#fffbeb";
const ERROR             = "#dc2626"; // Red 600
const ERROR_LIGHT       = "#fef2f2";
const INFO              = "#2563eb"; // Blue 600
const INFO_LIGHT        = "#eff6ff";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Slate oscuro premium — sofisticado, sin gradiente azulado
const SIDEBAR_BG_FROM   = "#0a0e1a"; // Casi negro puro
const SIDEBAR_BG_MID    = "#111827"; // Slate 900
const SIDEBAR_BG_TO     = "#0f172a"; // Slate 950
const SIDEBAR_GRADIENT  = `linear-gradient(180deg, ${SIDEBAR_BG_FROM} 0%, ${SIDEBAR_BG_MID} 60%, ${SIDEBAR_BG_TO} 100%)`;

// Logo — gradiente naranja a amber
const LOGO_GRADIENT     = `linear-gradient(135deg, ${PRIMARY} 0%, #d97706 100%)`;

// ─── Colores de avatar (ciclo para usuarios sin foto) ─────────────────────────
const AVATAR_COLORS     = ["#ea580c", "#2563eb", "#7c3aed", "#059669", "#e11d48", "#0891b2"];

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

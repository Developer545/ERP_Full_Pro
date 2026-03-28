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
// Paleta activa: Speeddansys Orange — naranja caido, warm, ERP profesional
// Copiado de DeskERP tema "speeddansys-orange-light"
// Otras opciones comentadas:
//   Emerald: PRIMARY = "#059669"  HOVER = "#047857"  LIGHT = "#ecfdf5"
//   Violet:  PRIMARY = "#7c3aed"  HOVER = "#6d28d9"  LIGHT = "#f5f3ff"
//   Rose:    PRIMARY = "#e11d48"  HOVER = "#be123c"  LIGHT = "#fff1f2"
//   Dark:    PRIMARY = "#ea580c"  HOVER = "#c2410c"  LIGHT = "#fff7ed"
const PRIMARY           = "#f47920"; // Speeddansys Orange — naranja warm original
const PRIMARY_HOVER     = "#d96510"; // Hover mas profundo
const PRIMARY_LIGHT     = "#fff4ec"; // Fondo suave iconos/badges
const PRIMARY_DARK      = "#b85410"; // Modo oscuro

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
// Sidebar casi negro — igual que Speeddansys Orange (Light) del DeskERP
const SIDEBAR_BG_FROM   = "#111111"; // Near black — igual que DeskERP
const SIDEBAR_BG_MID    = "#111111";
const SIDEBAR_BG_TO     = "#0a0a0a";
const SIDEBAR_GRADIENT  = "#111111"; // Sin gradiente, fondo plano como en DeskERP

// Logo — naranja Speeddansys
const LOGO_GRADIENT     = `linear-gradient(135deg, ${PRIMARY} 0%, #d96510 100%)`;

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

import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — configuracion minima.
 * En v4 la config se hace mayormente en CSS (@import "tailwindcss").
 * Preflight se deshabilita en globals.css para evitar conflictos con Ant Design.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1677ff",
        "bg-dark": "#0d1117",
        "surface-dark": "#161b22",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;

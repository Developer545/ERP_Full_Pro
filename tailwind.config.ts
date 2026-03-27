import type { Config } from "tailwindcss";

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
  // Evitar conflictos con Ant Design
  corePlugins: {
    preflight: false,
  },
};

export default config;

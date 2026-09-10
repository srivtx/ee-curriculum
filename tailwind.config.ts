import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Tailwind v4 is configured via @theme inline in src/app/globals.css.
// This legacy config is kept for tooling compatibility only.
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: '8px',
        md: '8px',
        sm: '8px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;

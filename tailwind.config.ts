import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.08)",
        glow: "0 0 0 1px rgba(56, 189, 248, 0.5), 0 6px 18px rgba(56, 189, 248, 0.25)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 40%), radial-gradient(circle at top left, rgba(234,179,8,0.15), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;

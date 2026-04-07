import type { Config } from "tailwindcss";

/**
 * Цвета из :root (globals.css). Не дублируем hex — только var() и rgb(.../<alpha-value>) для opacity.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          bg: "var(--bg-main)",
          DEFAULT: "var(--bg-main-2)",
          card: "var(--bg-card)",
          "card-soft": "var(--bg-card-soft)",
          hover: "var(--accent-secondary-soft)",
          active: "var(--accent-secondary-soft)",
          subtle: "var(--bg-card-soft)",
        },
        ink: {
          DEFAULT: "var(--text-main)",
          strong: "var(--text-strong)",
          secondary: "var(--text-soft)",
          tertiary: "var(--text-muted)",
          faint: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-main-rgb) / <alpha-value>)",
          light: "var(--accent-soft)",
          dark: "var(--accent-dark)",
          muted: "var(--accent-secondary)",
        },
        "accent-secondary": {
          DEFAULT: "var(--accent-secondary)",
          soft: "var(--accent-secondary-soft)",
        },
        "accent-info": {
          DEFAULT: "var(--accent-info)",
          soft: "var(--accent-info-soft)",
        },
        "accent-danger": {
          DEFAULT: "var(--accent-danger)",
          soft: "var(--accent-danger-soft)",
        },
        "accent-neutral": {
          DEFAULT: "var(--accent-neutral)",
          soft: "var(--accent-neutral-soft)",
        },
        semantic: {
          danger: "rgb(var(--accent-danger-rgb) / <alpha-value>)",
          "danger-light": "var(--accent-danger-soft)",
          info: "var(--accent-info)",
          "info-light": "var(--accent-info-soft)",
          warning: "var(--accent-neutral)",
          "warning-light": "var(--accent-neutral-soft)",
          success: "var(--accent-info)",
          "success-light": "var(--accent-info-soft)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        brand: {
          50: "var(--bg-card-soft)",
          100: "var(--accent-soft)",
          200: "var(--border)",
          300: "var(--border-strong)",
          400: "var(--text-muted)",
          500: "var(--text-soft)",
          600: "var(--accent-main)",
          700: "var(--accent-dark)",
          800: "var(--text-strong)",
          900: "var(--text-main)",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card: "var(--shadow-soft)",
        "card-elevated": "0 16px 36px rgba(24, 35, 49, 0.10)",
        "card-hover": "0 20px 44px rgba(24, 35, 49, 0.12)",
        metric: "var(--shadow-soft)",
        nav: "0 2px 12px rgba(24, 35, 49, 0.06)",
      },
      maxWidth: {
        content: "73.75rem",
      },
      fontSize: {
        hero: ["2.5rem", { lineHeight: "1.15", fontWeight: "700" }],
        "hero-mobile": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        section: ["1.5rem", { lineHeight: "1.3", fontWeight: "650" }],
        "section-mobile": ["1.25rem", { lineHeight: "1.3", fontWeight: "650" }],
        "card-title": ["1.125rem", { lineHeight: "1.4", fontWeight: "650" }],
      },
    },
  },
  plugins: [],
};
export default config;

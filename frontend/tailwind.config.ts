import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
      },
      colors: {
        surface: {
          bg: "var(--bg-main)",
          DEFAULT: "var(--bg-main-2)",
          card: "var(--bg-card)",
          "card-soft": "var(--bg-card-soft)",
          hover: "var(--accent-gold-soft)",
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
        burgundy: {
          DEFAULT: "rgb(var(--accent-burgundy-rgb) / <alpha-value>)",
          soft: "var(--accent-burgundy-soft)",
        },
        sage: {
          DEFAULT: "rgb(var(--accent-sage-rgb) / <alpha-value>)",
          soft: "var(--accent-sage-soft)",
        },
        gold: {
          DEFAULT: "rgb(var(--accent-gold-rgb) / <alpha-value>)",
          soft: "var(--accent-gold-soft)",
          bright: "var(--accent-gold-bright)",
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
          success: "var(--accent-sage)",
          "success-light": "var(--accent-sage-soft)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          light: "rgba(18, 24, 32, 0.07)",
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
        "3xl": "1.35rem",
      },
      boxShadow: {
        card: "var(--shadow-soft)",
        premium: "var(--shadow-premium)",
        "premium-lg": "var(--shadow-premium-lg)",
        "card-elevated": "var(--shadow-premium)",
        "card-hover": "0 24px 48px rgba(18, 24, 32, 0.14)",
        metric: "var(--shadow-soft)",
        nav: "0 4px 24px rgba(18, 24, 32, 0.08)",
        glow: "0 0 48px rgba(201, 162, 39, 0.22)",
      },
      maxWidth: {
        content: "73.75rem",
      },
      fontSize: {
        hero: ["2.75rem", { lineHeight: "1.12", fontWeight: "600" }],
        "hero-mobile": ["2.125rem", { lineHeight: "1.18", fontWeight: "600" }],
        section: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "section-mobile": ["1.3rem", { lineHeight: "1.32", fontWeight: "600" }],
        "card-title": ["1.125rem", { lineHeight: "1.45", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
export default config;

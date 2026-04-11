import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(125, 211, 252, 0.08), 0 24px 80px rgba(2, 6, 23, 0.55)",
        soft: "0 12px 40px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 32%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.14), transparent 28%), radial-gradient(circle at bottom, rgba(14, 116, 144, 0.22), transparent 34%)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.7s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

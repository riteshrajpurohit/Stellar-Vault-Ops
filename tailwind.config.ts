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
        glow: "0 0 0 1px rgba(125, 211, 252, 0.12), 0 24px 80px rgba(2, 6, 23, 0.65), 0 0 30px rgba(34, 211, 238, 0.1)",
        soft: "0 12px 40px rgba(15, 23, 42, 0.35)",
        "glow-cyan":
          "0 0 20px rgba(34, 211, 238, 0.25), 0 0 40px rgba(34, 211, 238, 0.1)",
        "glow-success":
          "0 0 20px rgba(34, 197, 94, 0.2), 0 0 40px rgba(34, 197, 94, 0.08)",
        "glow-error":
          "0 0 20px rgba(229, 62, 62, 0.2), 0 0 40px rgba(229, 62, 62, 0.08)",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(circle at top left, rgba(16, 185, 229, 0.2), transparent 35%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 30%), radial-gradient(circle at bottom, rgba(139, 92, 246, 0.14), transparent 35%)",
        "gradient-cyan-blue":
          "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)",
        "gradient-success-glow":
          "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
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

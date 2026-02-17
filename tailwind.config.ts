import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.18)"
      },
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(222.2 84% 56.5%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
        primary: {
          DEFAULT: "hsl(222.2 84% 56.5%)",
          foreground: "hsl(210 40% 98%)"
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 47.4% 11.2%)"
        },
        muted: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(215.4 16.3% 46.9%)"
        },
        accent: {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 47.4% 11.2%)"
        },
        destructive: {
          DEFAULT: "hsl(0 72.2% 50.6%)",
          foreground: "hsl(210 40% 98%)"
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 47.4% 11.2%)"
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: []
};

export default config;


import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050B17",
          900: "#0A1428",
          800: "#0E2337",
          700: "#163049",
        },
        teal: {
          DEFAULT: "#0AC8B9",
          dark: "#0A8E84",
        },
        gold: {
          DEFAULT: "#C8AA6E",
          dark: "#8A7340",
        },
        ember: {
          DEFAULT: "#C8440A",
        },
        feedback: {
          hit: "#22C55E",
          near: "#EAB308",
          miss: "#3F3F46",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cinzel", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

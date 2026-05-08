import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page surfaces — deep midnight blue tinted slightly warm
        ink: {
          1000: "#06080F", // page background, deepest
          900: "#0B0F1C", // secondary surface
          800: "#11162A", // card surface
          700: "#1A2140", // elevated card
          600: "#2A3354", // muted divider
          500: "#3D496D", // hairline highlight
        },
        // Warm off-white text — like aged card stock
        parchment: {
          50: "#F4ECDB", // primary text
          100: "#E2D5BB",
          200: "#B6A786", // secondary text
          300: "#8A7D5E", // tertiary
          400: "#5F5641", // disabled
        },
        // Gold foil accents
        foil: {
          DEFAULT: "#D9B563",
          dim: "#9C7E3F",
          bright: "#EFD083",
          deep: "#6E5829",
        },
        // Crimson — defense / ember
        crimson: {
          DEFAULT: "#C25040",
          dim: "#883527",
        },
        // Feedback colors (grid hit/near/miss)
        feedback: {
          hit: "#5BBF7A",
          near: "#E0B044",
          miss: "#3A4054",
        },
        // Field — deep moss tinted toward warm
        turf: {
          deep: "#0F1A18",
          mid: "#15241F",
          line: "#2C403B",
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', "Impact", "sans-serif"],
        sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // Tracked-caps eyebrow scale
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.22em" }],
      },
      letterSpacing: {
        caps: "0.18em",
        "caps-tight": "0.12em",
        "caps-loose": "0.32em",
      },
      borderRadius: {
        card: "10px",
        plate: "14px",
      },
      boxShadow: {
        plate: "0 1px 0 rgba(217,181,99,0.08), inset 0 0 0 1px rgba(217,181,99,0.10), 0 18px 40px -22px rgba(0,0,0,0.7)",
        foil: "0 0 0 1px rgba(217,181,99,0.5), 0 0 24px -6px rgba(217,181,99,0.4)",
        "card-deep": "0 18px 40px -20px rgba(0,0,0,0.85), 0 4px 12px -6px rgba(0,0,0,0.6)",
      },
      animation: {
        "foil-shine": "foil-shine 2.4s ease-out infinite",
        "card-tilt-in": "card-tilt-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up": "fade-up 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
        pulse: "pulse-foil 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "foil-shine": {
          "0%": { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "-100% 50%" },
        },
        "card-tilt-in": {
          "0%": { opacity: "0", transform: "translateY(8px) rotateX(8deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotateX(0deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-foil": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,181,99,0.6)" },
          "50%": { boxShadow: "0 0 0 6px rgba(217,181,99,0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

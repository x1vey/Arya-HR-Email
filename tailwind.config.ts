import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F6ED",
        ink: "#212A20",
        muted: "#7A8474",
        brand: {
          DEFAULT: "#4F6B4A",
          dark: "#3F4A3D",
          light: "#EAEEE2",
          mid: "#5D7B5D",
          pale: "#DDE3D2",
          deep: "#212A20",
        },
        surface: {
          DEFAULT: "#F4F6ED",
          warm: "#EAEEE2",
          card: "#FFFFFF",
          muted: "#DDE3D2",
        },
        accent: {
          warm: "#9B7A4A",
          gold: "#D4A04A",
          coral: "#C96442",
          purple: "#A06AC9",
          teal: "#7CAAB2",
          blue: "#7C9EFF",
        },
        rail: "#212A20",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4F6B4A 0%, #5D7B5D 100%)",
      },
      boxShadow: {
        panel:
          "0 1px 2px rgba(33,42,32,0.04), 0 4px 16px rgba(33,42,32,0.06)",
        float: "0 4px 24px rgba(33,42,32,0.14)",
        soft: "0 1px 3px rgba(33,42,32,0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F2FB",
        ink: "#15112B",
        muted: "#6B6585",
        // Canva-style brand palette
        brand: {
          DEFAULT: "#7C3AED",
          dark: "#6D28D9",
          light: "#EDE7FF",
          fuchsia: "#C026D3"
        },
        rail: "#1E1A2E"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(21,17,43,0.04), 0 4px 16px rgba(21,17,43,0.06)",
        float: "0 4px 24px rgba(21,17,43,0.18)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    }
  },
  plugins: []
};

export default config;

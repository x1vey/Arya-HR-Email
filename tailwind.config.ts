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
        canvas: "#F8FAFC",
        ink: "#0F172A",
        muted: "#64748B"
      }
    }
  },
  plugins: []
};

export default config;

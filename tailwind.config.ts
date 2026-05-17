import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1419",
        card: "#1a2028",
        elevated: "#232a33",
        border: "#2d3640",
        muted: "#8a96a3",
        accent: "#4ade80",
        promoter: "#22c55e",
        passive: "#fbbf24",
        detractor: "#ef4444"
      }
    }
  },
  plugins: []
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#0b0f14",
          panel: "#121820",
          border: "#1f2a37",
          accent: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};

export default config;

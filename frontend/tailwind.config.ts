import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        coral: {
          300: "#ffb8a5",
          400: "#ff8a6b",
          500: "#ff5e3d",
          600: "#e04420",
          700: "#c03010",
        },
        navy: {
          700: "#1a2755",
          800: "#0f1a40",
          900: "#0a1128",
          950: "#06091a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
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
        navy: "#0B1B3D",
        "navy-light": "#1a3263",
        gold: "#FDB913",
        "gold-dark": "#d99d0a",
        action: "#D32F2F",
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        sans: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
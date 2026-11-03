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
        navy: "#28346F",
        "navy-light": "#3B4A83",
        gold: "#FFC13D",
        "gold-dark": "#E2A51D",
        action: "#28346F",
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
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
        navy: "#14263D",
        "navy-light": "#243C5B",
        gold: "#C2A36B",
        "gold-dark": "#8B7146",
        action: "#14263D",
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
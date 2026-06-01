/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
        malak: {
          gold: "#C9A84C",
          dark: "#1a1a2e",
          navy: "#16213e",
          blue: "#0f3460",
          light: "#f8f9fa",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        hebrew: ["Assistant", "sans-serif"],
      },
    },
  },
  plugins: [],
};

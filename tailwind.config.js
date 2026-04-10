/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#0F6E56", dark: "#085041", light: "#1D9E75" },
        mint: { DEFAULT: "#E1F5EE", dark: "#9FE1CB" },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

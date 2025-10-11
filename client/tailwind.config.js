// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // COLORES CORPORATIVOS (INTOCABLES)
        "macrosad-pink": "#e5007e",
        "macrosad-purple": "#6c3b5d",

        // Tonos para el tema claro
        "light-bg": "#F3F4F6", // Un gris muy claro para el fondo principal
        "light-card": "#FFFFFF", // Blanco para las tarjetas
        "text-dark": "#111827", // Texto principal oscuro
        "text-light": "#6B7280", // Texto secundario más claro
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'macrosad-pink': '#e5007e',
        'macrosad-purple': '#6c3b5d',
        'gradient-start': '#e5007e',
        'gradient-end': '#a84c98',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
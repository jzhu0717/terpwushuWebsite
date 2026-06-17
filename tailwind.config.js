/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bookman: ['"Libre Baskerville"', 'serif'],
      },
      colors: {
        brand: {
          red: '#c21807',
          white: '#dee0df',
        },
      },
    },
  },
  plugins: [],
}
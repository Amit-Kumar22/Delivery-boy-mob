/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2EB85C',
          dark: '#27A350',
          light: '#E8F7EE',
        },
        khana: {
          green: '#2EB85C',
          darkGreen: '#27A350',
          lightGreen: '#E8F7EE',
        }
      }
    },
  },
  plugins: [],
}

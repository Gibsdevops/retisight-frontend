/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary clinical blue
        medical: {
          DEFAULT: "#0284c7",
          50: "#e9f7fd",
          100: "#d6f3fb",
          200: "#a9e7f8",
          300: "#7bdbf5",
          400: "#4ecff2",
          500: "#28bfea",
          600: "#0284c7", // main
          700: "#026f9f",
          800: "#025b78",
          900: "#014651",
        },
      },
      boxShadow: {
        'card-glow': '0 10px 30px rgba(2, 132, 199, 0.08)',
      },
      borderRadius: {
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
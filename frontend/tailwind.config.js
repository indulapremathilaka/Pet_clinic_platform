/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf6",
          100: "#dcfced",
          200: "#bbf7db",
          300: "#86eec0",
          400: "#4bdc9d",
          500: "#22c07f",
          600: "#159a66",
          700: "#137a54",
          800: "#136045",
          900: "#124f3a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

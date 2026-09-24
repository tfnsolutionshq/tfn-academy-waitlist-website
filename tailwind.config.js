/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bgt: ["Bricolage Grotesque", "sans-serif"],
      },
    },
  },
  plugins: [],
};

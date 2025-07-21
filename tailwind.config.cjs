/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
  darkMode: "class", // allows toggling dark mode manually
  theme: {
    extend: {
      fontFamily: {
<<<<<<< HEAD
        sans: ["LXGW GB Lite", "sans-serif", ...defaultTheme.fontFamily.sans],
=======
        sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

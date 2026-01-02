/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism color scheme
        'neo-red': '#FF6B6B',
        'neo-yellow': '#FFD93D',
        'neo-violet': '#C4B5FD',
        'neo-cream': '#FFFDF5',
        'neo-black': '#000000',
        'neo-white': '#FFFFFF',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000',
        'neo-sm': '2px 2px 0px 0px #000',
        'neo-lg': '6px 6px 0px 0px #000',
        'neo-pressed': '0px 0px 0px 0px #000',
      },
      borderWidth: {
        'neo': '4px',
      },
      fontFamily: {
        'neo': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

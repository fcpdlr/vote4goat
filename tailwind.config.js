const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        goat: '#D98C3F',
        background: '#1E2A38',
        // Redesign v3 palette (see REDESIGNPLAN.md section 0) — additive,
        // kept separate from the tokens above while both systems coexist.
        paper: '#FBFAF5',
        ink: '#161410',
        'side-a': '#2456E6',
        'side-b': '#E63946',
        tie: '#DAD7CB',
        champion: '#F2B520',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ps-bg': '#0e1a2b',
        'ps-blue': '#0072ce',
        'ps-blue-light': '#1a8aff',
        'ps-blue-dark': '#00264d',
        'ps-gray': '#8899aa',
        'ps-dark': '#0a1420',
        'ps-highlight': '#00bbff',
        'ps-green': '#4cdc4c',
        'ps-gold': '#ffcc33',
      },
      fontFamily: {
        ps: ['-apple-system', 'Segoe UI', 'SST', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#9B5DE5',
        'soft-lavender': '#E0BBE4',
        'pale-lilac': '#F5EAFE',
        'light-gray': '#5E5E5E',
        'accent-pink': '#FF6F91',
        'off-white': '#FCFCFC',
        'calm-blue-tint': '#C3F0FF',
      },
    },
  },
  plugins: [],
};
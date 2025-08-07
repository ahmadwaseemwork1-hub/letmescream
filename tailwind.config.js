/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0d0d0d',
        'dark-surface': '#1a1a1a',
        'neon-purple': '#9B5DE5',
        'neon-pink': '#FF6F91',
        'neon-cyan': '#C3F0FF',
        'neon-white': '#ffffff',
        'neon-gray': '#888888',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'neon-pulse': 'neonBreathe 2s ease-in-out infinite',
        'scream-shake': 'screamShake 0.5s ease-in-out',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(155, 93, 229, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 111, 145, 0.5)',
        'neon-cyan': '0 0 20px rgba(195, 240, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
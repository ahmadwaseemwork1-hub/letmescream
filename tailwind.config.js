/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark': '#0a0a0a',
        'dark-card': '#1a1a1a',
        'neon-purple': '#9b5de5',
        'neon-pink': '#ff3366',
        'neon-cyan': '#00ffff',
        'electric-blue': '#0066ff',
        'toxic-green': '#39ff14',
        'gray-800': '#1f2937',
        'gray-700': '#374151',
        'gray-600': '#4b5563',
        'gray-400': '#9ca3af',
        'gray-300': '#d1d5db',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 51, 102, 0.3), 0 0 40px rgba(155, 93, 229, 0.2), 0 0 60px rgba(0, 255, 255, 0.1)',
        'neon-strong': '0 0 30px rgba(255, 51, 102, 0.5), 0 0 60px rgba(155, 93, 229, 0.3), 0 0 90px rgba(0, 255, 255, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      fontSize: {
        '7xl': '5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      fontWeight: {
        'black': '900',
      },
    },
  },
  plugins: [],
};
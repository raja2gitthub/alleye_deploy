import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        'tech-mono': ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        'primary-green': '#00ff00',
        'cyber-blue': '#00aaff',
        'background-dark': '#1a1a2e',
        'background-light': '#16213e',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-scale': 'fade-in-scale 0.2s ease-out forwards',
        'pulseTimer': 'pulseTimer 2s infinite',
        'pulseCountdown': 'pulseCountdown 1s infinite',
        'pulseWarning': 'pulseWarning 1s infinite',
        'pulseDanger': 'pulseDanger 0.5s infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: 0, transform: 'translateY(10px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        pulseTimer: { '50%': { boxShadow: '0 0 25px rgba(0, 255, 0, 0.6), 0 0 35px rgba(0, 255, 0, 0.2)' } },
        pulseCountdown: { '50%': { transform: 'scale(1.05)' } },
        pulseWarning: { '50%': { boxShadow: '0 0 25px rgba(255, 170, 0, 0.8)' } },
        pulseDanger: { '50%': { boxShadow: '0 0 25px rgba(255, 0, 0, 0.8)' } },
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#00ff00",
          "primary-content": "#000000",
          "secondary": "#00aaff",
          "accent": "#f59e0b",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
        dark: {
          "primary": "#00ff00",
          "primary-content": "#000000",
          "secondary": "#00aaff",
          "accent": "#f59e0b",
          "neutral": "#3d4451",
          "base-100": "#1d232a",
          "base-200": "#191e24",
          "base-300": "#15191e",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
}
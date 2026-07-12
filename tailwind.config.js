/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#000000',
          dark: '#0f0f0f',
          gray: '#111111',
          light: '#181818',
          accent: '#ff0000',
          purple: '#b30000',
          cyan: '#ff4444',
          pink: '#ff2b2b',
          border: 'rgba(255, 0, 0, 0.2)',
          glow: 'rgba(255, 43, 43, 0.35)'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        clash: ['Clash Display', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Share Tech Mono', 'Courier New', 'monospace']
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'radar': 'radar 4s linear infinite',
        'typing': 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite'
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        }
      },
      backdropBlur: {
        cyber: '12px'
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        secondary: {
          50: '#fefdf8',
          100: '#fefbeb',
          200: '#fef7c3',
          300: '#fef08a',
          400: '#fde047',
          500: '#facc15',
          600: '#eab308',
          700: '#ca8a04',
          800: '#a16207',
          900: '#854d0e'
        },
        earth: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cfc7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b'
        },
        rick: {
          green: '#32CD32',
          purple: '#8A2BE2',
          pink: '#FF69B4'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'slime-drip': 'slimeDrip 2s ease-out infinite',
        'slime-wiggle': 'slimeWiggle 1s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slimeDrip: {
          '0%': { transform: 'scaleY(1) translateY(0)' },
          '50%': { transform: 'scaleY(1.1) translateY(2px)' },
          '100%': { transform: 'scaleY(1) translateY(0)' },
        },
        slimeWiggle: {
          '0%': { transform: 'skewX(0deg)' },
          '100%': { transform: 'skewX(2deg)' },
        }
      }
    },
  },
  plugins: [],
}
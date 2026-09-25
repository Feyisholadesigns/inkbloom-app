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
        brand: {
          bg: 'var(--color-dark-bg)',       // #1A1118
          surface: 'var(--color-dark-surface)', // #2A1B24
          text: 'var(--color-dark-text)',   // #FFF8F5
        },
        burgundy: {
          50: 'var(--color-burgundy-50)',
          100: 'var(--color-burgundy-100)',
          200: 'var(--color-burgundy-200)',
          300: 'var(--color-burgundy-300)',
          400: 'var(--color-burgundy-400)',
          500: 'var(--color-burgundy-500)',
          600: 'var(--color-burgundy-600)',
          700: 'var(--color-burgundy-700)',
          800: 'var(--color-burgundy-800)',
          900: 'var(--color-burgundy-900)', 
        },
        gold: {
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'Poppins', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
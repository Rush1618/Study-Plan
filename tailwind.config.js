/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F0EAD8',
          300: '#E4DCBE',
          400: '#D5C99F',
          500: '#B8A873',
          900: '#2A2416',
        },
        ink: {
          50: '#F4F7F6',
          100: '#E2EBE8',
          200: '#C2D5CF',
          500: '#3D6B61',
          700: '#244B43',
          800: '#1B3B34',
          900: '#142B26',
          950: '#0C1C18',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#FCE8E2',
          200: '#F9D4C7',
          400: '#EB8B6E',
          500: '#C85A32',
          600: '#B24B25',
          700: '#923B1B',
        },
        sage: {
          50: '#F2F7F4',
          100: '#E2ECE5',
          500: '#2D6A4F',
          600: '#24563F',
          700: '#1B4130',
        },
        amberGold: {
          50: '#FFFDF6',
          100: '#FEF9E6',
          500: '#C28E1D',
          600: '#A47414',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 14px -2px rgba(20, 43, 38, 0.05), 0 1px 4px -1px rgba(20, 43, 38, 0.03)',
        'elevated': '0 10px 30px -4px rgba(20, 43, 38, 0.08), 0 4px 10px -2px rgba(20, 43, 38, 0.04)',
        'paper': '0 1px 3px rgba(0,0,0,0.04), 0 20px 40px -15px rgba(20, 43, 38, 0.06)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        'a4': '210mm',
      },
      minHeight: {
        'a4': '297mm',
      },
      fontSize: {
        'xs': ['11px'],
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      colors: {
        navy: '#1a365d',
        mint: '#e6fffa',
        steppergold: '#c5a059',
        paleblue: '#eef2f5',
        skyblue: '#ADD8E6',
        oxblood: '#4A0404',
        gold: '#D4AF37',
        parchment: '#FDFBF7',
        taupe: '#E5E1DA',
        maroon: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc1c1',
          300: '#ffa1a1',
          400: '#ff8181',
          500: '#ff6161',
          600: '#cc0000',
          700: '#a30000',
          800: '#800000',
          900: '#4a0404',
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa', 100: '#dbe5f1', 200: '#bcd0e6', 300: '#8fb2d4',
          400: '#5a8abf', 500: '#3a6ba8', 600: '#2c5489', 700: '#243f6b',
          800: '#1c3050', 900: '#13213a', 950: '#0c1626',
        },
        gold: {
          50: '#fdf9ec', 100: '#faf0c8', 200: '#f5e08c', 300: '#efc94f',
          400: '#e9b62a', 500: '#d39a16', 600: '#b07710', 700: '#8c5710',
          800: '#734614', 900: '#623b17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(19,33,58,0.08), 0 1px 2px rgba(19,33,58,0.04)',
        'card-hover': '0 10px 30px rgba(19,33,58,0.10)',
      },
    },
  },
  plugins: [],
}

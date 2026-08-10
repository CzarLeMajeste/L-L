/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#838ea6',
          500: '#646f8a',
          600: '#4f5871',
          700: '#41485c',
          800: '#383d4d',
          900: '#1f2230',
          950: '#14161f',
        },
        brand: {
          50: '#eefcf6',
          100: '#d4f7e8',
          200: '#abedd3',
          300: '#75dfba',
          400: '#3fc89b',
          500: '#18ae82',
          600: '#0c8c69',
          700: '#0a7056',
          800: '#0b5945',
          900: '#0a4839',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,22,32,.04), 0 8px 24px -12px rgba(16,22,32,.12)',
        lift: '0 2px 4px rgba(16,22,32,.06), 0 18px 40px -16px rgba(16,22,32,.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
        'scale-in': 'scale-in .25s ease-out both',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F5F3EF',
          dim: '#E6E3DC',
          container: '#EFEDE7',
          'container-low': '#F9F7F2',
          'container-high': '#E9E7E1',
        },
        forest: {
          50:  '#F0FAF4',
          100: '#D1F5E0',
          200: '#B7F1BA',
          300: '#7DDBA3',
          400: '#4CAF7A',
          500: '#2D6A4F',
          600: '#245A42',
          700: '#1B4332',
          800: '#14352A',
          900: '#0D2818',
        },
        slate: {
          blue:    '#4A6FA5',
          'blue-light': '#D4E3FF',
        },
        amber: {
          warm:    '#D4A843',
          'warm-light': '#FFF3D0',
        },
      },
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}

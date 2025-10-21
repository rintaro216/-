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
          orange: '#FF8C42',
          green: '#4CAF50',
        },
        bg: {
          light: '#FFF9F5',
        },
        status: {
          available: '#4CAF50',
          limited: '#FF8C42',
          occupied: '#9E9E9E',
          selected: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '26': 'repeat(26, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}


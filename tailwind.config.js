/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C2A22',
          light: '#9D453B',
          dark: '#5D1D18',
        },
        accent: {
          DEFAULT: '#A3812F',
          light: '#C9A958',
          dark: '#6F5614',
        },
        bg: {
          DEFAULT: '#F7F2E7',
          card: '#F7F2E7',
          dark: '#17140F',
        },
        text: {
          DEFAULT: '#211D16',
          muted: '#665D4B',
          light: '#9B927D',
        },
        dark: {
          bg: '#17140F',
          card: '#211D16',
          text: '#F1EADA',
          muted: '#B9AE97',
          border: '#4A4235',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'SimSun', 'STSong', 'Georgia', 'serif'],
        body: ['"Noto Serif SC"', 'SimSun', 'STSong', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(60, 36, 21, 0.08), 0 1px 2px rgba(60, 36, 21, 0.06)',
        'card-hover': '0 4px 12px rgba(60, 36, 21, 0.1), 0 2px 4px rgba(60, 36, 21, 0.06)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
    },
  },
  plugins: [],
}

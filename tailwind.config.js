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
          DEFAULT: '#C85A17', // 暖橙色主色
          light: '#E8772E',
          dark: '#A0440F',
        },
        accent: {
          DEFAULT: '#D4A853', // 金色点缀
          light: '#E4C078',
          dark: '#B8903A',
        },
        bg: {
          DEFAULT: '#F5F0E8', // 米色背景
          card: '#FAF7F2',
          dark: '#1A1A2E',
        },
        text: {
          DEFAULT: '#3C2415', // 深棕正文
          muted: '#8B7355',
          light: '#A09080',
        },
        dark: {
          bg: '#1a1a2e',
          card: '#16213e',
          text: '#e0e0e0',
          muted: '#a0a0a0',
          border: '#2a2a4a',
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

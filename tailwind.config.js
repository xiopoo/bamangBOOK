/** @type {import('tailwindcss').Config} */
// 设计令牌：颜色须与 src/app/globals.css 的 --archive-* 变量保持同值。
// 浅色 primary/accent/bg/text 对应 --archive-oxblood/gold/paper/ink；
// 暗色 primary.light/accent.light 对应 .dark body 下的 --archive-oxblood/gold。
// 两处任一处修改必须同步另一处（见 globals.css 顶部规范注释）。
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
          DEFAULT: '#AB1942',
          light: '#C64B6B',
          dark: '#861230',
        },
        accent: {
          DEFAULT: '#9A7A37',
          light: '#B69751',
          dark: '#705722',
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

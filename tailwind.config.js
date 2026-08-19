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
        // 与 tokens.css --archive-sans 同源：界面层（导航/元信息/按钮）用无衬线，
        // 阅读层用衬线，两层分工是全站版式语言的基础。
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      // 与 tokens.css --elev-1/2/3 同值（原 rgba(60,36,21) 色偏已纠正为墨色 rgba(33,29,22)）
      boxShadow: {
        'card': '0 1px 2px rgba(33, 29, 22, 0.05), 0 8px 24px rgba(33, 29, 22, 0.07)',
        'card-hover': '0 2px 6px rgba(33, 29, 22, 0.07), 0 18px 48px rgba(33, 29, 22, 0.14)',
      },
      // 与 tokens.css --archive-radius 同值（原 0.5rem 漂移已纠正为 0.375rem）
      borderRadius: {
        'card': '0.375rem',
      },
      // 与 tokens.css BREAKPOINTS 注释同值：全站只用这 4 档
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}

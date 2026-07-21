# Tasks

- [x] Task 1: 修复 seed-data.js 为空问题
  - [x] 1.1 编辑 `public/js/seed-data.js`，写入 `window.__SEED = {diagnosisCount: 128};`

- [x] Task 2: 修复 stats-in-hero 被图片覆盖问题
  - [x] 2.1 在 `.stats-in-hero` CSS 中添加 `position: relative; z-index: 3`

- [x] Task 3: 将 Hero `<img>` 标签改为 CSS `background-image`
  - [x] 3.1 移除 `.hero-slide` 中的 `<img>` 标签（3 个 slide 各移除一个）
  - [x] 3.2 修改 JS：由 `img.src = heroImages[i]` 改为 `slide.style.backgroundImage = 'url(...), linear-gradient(...)'`
  - [x] 3.3 移除 `<img>` 的 `onerror/onload` 事件监听（hero-slide-img 已从 querySelectorAll 移除，保留 case/service）
  - [x] 3.4 移除 `.hero-slide-img` CSS 规则
  - [x] 3.5 移除 `.hero-overlay` DOM 元素和 CSS（不再需要）

- [x] Task 4: 部署与验证
  - [x] 4.1 git add + commit + push
  - [x] 4.2 Vercel 部署后验证：
    - 统计数据全部可见
    - Hero 图片正常显示为背景图
    - 文字、球体、按钮不受影响
    - 轮播切换功能正常

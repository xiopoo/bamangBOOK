# Checklist

## 统计数据修复
- [x] `seed-data.js` 包含 `window.__SEED = {diagnosisCount: 128}`
- [x] `.stats-in-hero` 有 `position: relative; z-index: 3`
- [x] 4 个统计数字全部可见（诊断数、债务化解、就业岗位、净利润）
- [x] `#diagnosis-count` 显示初始值 `128+`

## Hero 图片背景化
- [x] `.hero-slide` 内不再有 `<img>` 标签
- [x] JS 使用 `slide.style.backgroundImage` 设置图片
- [x] 背景图片格式：`url(...), linear-gradient(...)`（图片在上，渐变兜底在下）
- [x] `.hero-slide-img` CSS 规则已移除
- [x] hero 相关 `<img>` 的 onerror/onload 事件已移除（保留 case/service 部分）
- [x] `.hero-overlay` DOM 元素已移除
- [x] `.hero-overlay` CSS 规则已移除

## 简化后的层叠结构
- [x] 图片使用背景层（无需 z-index）
- [x] `.hero-inner {z-index: 3}` 覆盖文字 + 球体
- [x] `.stats-in-hero {z-index: 3}` 覆盖统计数据
- [x] `.hero-cta {z-index: 4}` 按钮
- [x] `.hero-carousel-dots {z-index: 5}` 指示点

## 部署验证
- [x] 代码已推送至 GitHub
- [x] Vercel 部署成功
- [x] 统计数据在浏览器可见
- [x] Hero 图片作为背景显示
- [x] 轮播切换正常
- [x] 文字和球体不受影响

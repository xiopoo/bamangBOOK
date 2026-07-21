# Checklist

## 椭圆背景 CSS
- [x] `.hero-content::before` CSS 规则已添加
- [x] 使用 `radial-gradient(ellipse at center, ...)` 创建渐变椭圆
- [x] 中心不透明度 65%，50% 处 40%，80% 处透明
- [x] `z-index: -1` 确保在文字后方
- [x] `pointer-events: none` 确保不干扰交互
- [x] `border-radius: 50%` 确保椭圆形
- [x] 负值 `top/left/right/bottom` 调整到合适尺寸

## 视觉验证
- [x] 椭圆背景颜色为品牌色 `#AB1942`
- [x] 白色文字在椭圆背景上清晰可读
- [x] 椭圆边缘自然渐变，无硬切边
- [x] 椭圆不遮挡 CTA 按钮
- [x] 椭圆在所有 3 张轮播图片上效果一致

## 部署验证
- [x] 代码已推送至 GitHub
- [x] Vercel 部署成功
- [x] 浏览器验证椭圆背景显示
- [x] 文字在所有 Hero 轮播图片上均清晰可见

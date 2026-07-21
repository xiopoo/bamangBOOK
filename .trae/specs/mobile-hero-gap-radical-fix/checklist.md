# Checklist

## 移动端 CSS 修改（max-width: 767px）
- [ ] `.hero-inner` 的 `border-radius` 从 `16px` 改为 `16px 16px 0 0`
- [ ] `.stats-in-hero` 添加 `border-top: none`

## 视觉验证（移动端）
- [ ] `.hero-inner` 底部左右两侧无弧形缺口
- [ ] 两个色块之间无可见水平分隔线
- [ ] 两个色块呈现连续统一的背景区域
- [ ] 底层 Hero 图片完全不可见
- [ ] 所有文字清晰可读

## 桌面端不受影响
- [ ] 桌面端 `.hero-inner` 的 border-radius 保持完整（四周圆角）
- [ ] 桌面端 `.stats-in-hero` 的 border-top 分隔线正常显示
- [ ] 桌面端所有功能完整

## 部署验证
- [ ] 代码已推送至 GitHub
- [ ] Vercel 部署成功
- [ ] Chrome DevTools 移动端模拟器验证完全无缝

# Checklist

## CSS 修改
- [ ] `@media(max-width:767px)` 中添加 `.hero-inner::after`
- [ ] `::after{content:'';position:absolute;left:0;right:0;top:100%;height:50px;background:rgba(171,25,66,0.75);z-index:-1}`
- [ ] 桌面端不受影响（`::after` 默认不渲染）

## 视觉验证（移动端）
- [ ] `.hero-inner` 与 `.stats-in-hero` 之间无任何可见间隙
- [ ] 底层 Hero 图片完全不露出
- [ ] 所有文字内容清晰可读
- [ ] `.stats-in-hero` 渐变背景正常显示
- [ ] 滚动时间隙区域不出现闪烁

## 桌面端不受影响
- [ ] 桌面端 `.hero-inner::after` 不渲染
- [ ] 桌面端布局与之前完全一致
- [ ] Zone 区域装饰（球体、三圆环）正常显示

## 部署验证
- [ ] 代码已推送至 GitHub
- [ ] Vercel 部署成功
- [ ] 移动端浏览器真实设备验证（Chrome/Safari/微信内置浏览器）
- [ ] 不同屏幕尺寸验证（320px-767px）

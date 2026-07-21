# Checklist

- [x] Unsplash URL 可访问性已排查并有明确结论（curl 确认全部返回 HTTP 200）
- [x] 所有需要配图的页面均已加载 image-urls.js（experts.html 多余引用已移除）
- [x] index.html case-card 图片正常显示（3 个成功案例 + 3 个专栏卡片使用渐变兜底，属设计意图）
- [x] services.html service-image 正常显示
- [x] cases-detail.html case-image 正常显示（6 个案例循环使用 3 张图）
- [x] about.html about-banner 正常显示
- [x] 所有静态图片（logo、二维码、banner）均存在且路径正确
- [x] 图片加载机制已审计 — 两种方式（backgroundImage for hero/svc, img 创建 for 其他）均正确
- [x] service-image 添加 overflow:hidden 修复圆角裁剪
- [ ] 浏览器验证（Chrome/Safari/移动端）— 请在网站上线后确认

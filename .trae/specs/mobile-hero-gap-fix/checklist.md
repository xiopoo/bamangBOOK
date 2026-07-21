# Checklist

## 移动端 CSS 修改（max-width: 767px）
- [x] `.hero-inner` 添加 `z-index: 3`
- [x] `.hero-inner` 添加 `background: rgba(171, 25, 66, 0.75)`
- [x] `.hero-inner` 添加 `border-radius: 16px`
- [x] `.hero-inner` 设置 `padding: 24px 16px 0`
- [x] `.hero-content::before` 添加 `display: none`
- [x] `.stats-in-hero` 设置 `margin-top: 0`

## 视觉验证（移动端）
- [x] 文字面板与统计数据背景之间无间隙
- [x] 间隙区域无 Hero 图片露出
- [x] 所有文字（标题、描述、统计数据）清晰可读
- [x] CTA 按钮正常显示并可点击
- [x] 轮播指示点可操作

## 桌面端不受影响
- [x] 桌面端 `.hero-inner` 无背景和 z-index 变化
- [x] 桌面端 `.hero-content::before` 椭圆面板正常显示
- [x] 桌面端 `.stats-in-hero` 正常显示

## 部署验证
- [x] 代码已推送至 GitHub
- [x] Vercel 部署成功
- [x] 移动端规则已线上生效

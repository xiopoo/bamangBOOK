# Checklist

## CSS 修改
- [ ] `.hero-inner::after{...}` 规则已删除
- [ ] `.hero-inner{padding:24px 16px 10px}` — padding-bottom 从 0 改为 10px

## 视觉验证（移动端 max-width: 767px）
- [ ] 无重叠堆叠伪影（无 `::after` 透出）
- [ ] `.hero-inner` 与 `.stats-in-hero` 之间无可见间隙
- [ ] 底层 Hero 图片不露出
- [ ] `.stats-in-hero` 渐变背景正常显示（无异常色差）
- [ ] 所有文字清晰可读

## 桌面端不受影响
- [ ] 桌面端 `.hero-inner` 保持 `padding:20px 0 0`
- [ ] 桌面端布局不变

## 部署验证
- [ ] 代码已推送至 GitHub
- [ ] Vercel 部署成功
- [ ] 移动端模拟器验证通过

# Tasks

## 任务列表

### Task 1: 修复 `.hero` CSS — 添加 `min-height` 和层叠上下文 ✅

桌面端 `.hero` 缺少显式最小高度，且与移动端层叠上下文行为不一致。

- [x] 1.1 在 `.hero` CSS 规则中添加 `min-height:480px`
  - 确保 Hero 区域在任何桌面端视口下都有足够的高度展示轮播图片
  - 移动端媒体查询中 `.hero{overflow:visible;min-height:auto}` 已覆盖（行 413）
- [x] 1.2 在 `.hero-carousel` CSS 规则中添加 `z-index:1`
  - 确保轮播在层叠上下文中具有明确的位置
- [x] 1.3 在 `.hero-inner` CSS 规则（桌面端基线样式）中添加 `z-index:2`
  - 确保内容在轮播之上，与移动端行为一致
  - 移动端 `.hero-inner{z-index:3}` 媒体查询覆盖基线，无冲突

### Task 2: 优化 Hero 轮播图片加载和诊断 ✅

增强 JS 逻辑的健壮性和可诊断性。

- [x] 2.1 在 `backgroundImage` 注入后立即诊断输出 Hero 元素的实际高度
  ```javascript
  console.debug('[Hero] Hero element height:', heroEl.offsetHeight, 'min-height:', getComputedStyle(heroEl).minHeight);
  ```
- [x] 2.2 为注入代码添加 `try-catch` 包裹，防止任一环节出错中断后续执行
- [x] 2.3 验证 `heroImages` 数组非空且有正确路径（空数组时输出 `console.warn`）

### Task 3: 部署与验证 ✅

- [x] 3.1 git add + commit + push（commit fd4c731）
- [x] 3.2 Vercel 部署后验证桌面端轮播图片正常显示
- [x] 3.3 Vercel 部署后验证移动端轮播图片不受影响
- [x] 3.4 浏览器控制台确认 `[Hero]` / `[Image]` 诊断日志正常输出

## 任务依赖关系

- Task 2 依赖 Task 1（CSS 修复是基础）✅
- Task 3 依赖 Task 1 和 Task 2（部署前需完成所有代码修改）✅

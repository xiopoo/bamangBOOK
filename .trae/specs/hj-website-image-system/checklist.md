# Checklist

## Requirement 1: 全站配图位置与规范定义
- [x] 配图清单表格已建立，包含 10 个配图位置的主题、尺寸、应用页面
- [x] hero-1.jpg 主题为"现代产业园区/写字楼外景"，尺寸 1400×933
- [x] hero-2.jpg 主题为"企业会议室/战略讨论场景"，尺寸 1400×935
- [x] hero-3.jpg 主题为"数据分析/财务诊断场景"，尺寸 1400×933
- [x] case-1.jpg 主题为"建筑/工程行业场景"，尺寸 800×533
- [x] case-2.jpg 主题为"贸易/物流/制造行业场景"，尺寸 800×533
- [x] case-3.jpg 主题为"餐饮/服务/纾困场景"，尺寸 800×533
- [x] service-1.jpg 主题为"财务数据分析/诊断场景"，尺寸 800×534
- [x] service-2.jpg 主题为"一对一咨询/辅导场景"，尺寸 800×533
- [x] service-3.jpg 主题为"重组方案/多边协商场景"，尺寸 800×600
- [x] about-banner.jpg 主题为"专业团队/公司形象"，尺寸 1200×800

## Requirement 2: 统一图片加载机制（`<img>` 代替 `background-image`）
- [x] index.html Hero 轮播使用 `<img>` 标签，CSS `object-fit: cover`
- [x] index.html Case 卡片使用 `<img>` 标签
- [x] index.html Service 卡片使用 `<img>` 标签（非 JS 动态创建 div）
- [x] index.html 底部 JS 仅设置 `<img>` 的 `src` 属性，不操作 `backgroundImage`
- [x] services.html / cases-detail.html / about.html 保持现有 `<img>` 方式，统一引用 `image-urls-v2.js`

## Requirement 3: 图片加载三态机制
- [x] 加载中：容器显示品牌色背景（`#AB1942`）+ 半透明业务关键词
- [x] 加载成功：`img.onload` 触发后图片 `object-fit: cover` 填充，占位文字隐藏
- [x] 加载失败：`img.onerror` 触发后保持品牌色渐变兜底，显示业务关键词，无裂图图标
- [x] 三态在 Chrome 桌面端验证通过
- [x] 三态在 Safari 桌面端验证通过
- [x] 三态在移动端（iOS Safari / 微信内置浏览器）验证通过

## Requirement 4: 标准化缓存策略
- [x] vercel.json 中 JS 文件 `Cache-Control: public, max-age=0, must-revalidate`
- [x] vercel.json 中图片文件 `Cache-Control: public, max-age=604800`（无 `immutable`）
- [x] vercel.json 中 HTML 文件 `Cache-Control: public, max-age=0, must-revalidate`
- [x] vercel.json 中 CSS 文件 `Cache-Control: public, max-age=3600`
- [x] 部署后 curl 验证所有资源类型的 Cache-Control 头正确

## Requirement 5: 图片 URL 版本化管理
- [x] `image-urls-v2.js` 中所有图片 URL 包含 `?v=3` 版本参数
- [x] 版本号递增机制文档化（图片替换时手动递增版本号）

## Requirement 6: 全站图片完整性校验
- [x] `public/images/` 下 10 张配图全部存在
- [x] 所有图片文件为有效 JPEG 格式（`file` 命令验证魔数为 `JPEG image data`）
- [x] 所有图片文件大小 > 0 字节
- [x] `image-urls-v2.js` 中所有路径指向的文件实际存在
- [x] 所有引用配图的页面均已加载 `js/image-urls-v2.js`
- [x] logo（`logo-hjzc-transparent-white.png`）路径正确
- [x] 微信二维码（`wechat-qrcode.jpg`）路径正确

## 部署验证
- [x] 代码已推送至 GitHub
- [x] Vercel 部署成功
- [x] curl 验证所有 10 张配图 URL 返回 HTTP 200
- [x] 浏览器访问首页，Hero 轮播图片正常显示
- [x] 浏览器访问首页，Case 卡片图片正常显示
- [x] 浏览器访问首页，Service 卡片图片正常显示
- [x] 浏览器访问 about.html，Banner 图片正常显示
- [x] 浏览器访问 services.html，Service 图片正常显示
- [x] 浏览器访问 cases-detail.html，Case 图片正常显示
- [x] 断网模拟：图片加载失败后显示品牌色渐变兜底而非空白

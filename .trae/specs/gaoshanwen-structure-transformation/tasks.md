# 灰金重组官网结构重构 - 实施计划

## [ ] Task 1: 创建全站统一模板与视觉系统
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 建立全站统一的 CSS 样式系统（颜色变量、排版规范、间距体系、组件样式）
  - 创建统一的导航栏（header）和页脚（footer）组件结构
  - 导航：首页、关于、服务、案例、诊断（5 个一级导航）
  - 页脚：灰金重组整理 + 联系邮箱/电话
  - 视觉风格参考 gaoshanwen.com：极简、大留白、单栏居中、文字驱动
  - 主内容区 max-width: 680px（移动端 480px）
  - 品牌色 #AB1942 仅用于关键点缀
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-5, AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: 导航栏包含 5 个链接（首页、关于、服务、案例、诊断）
  - `programmatic` TR-1.2: 页脚包含运营方署名和联系方式
  - `human-judgement` TR-1.3: 整体视觉风格与 gaoshanwen.com 一致（极简、大留白、克制）
  - `human-judgement` TR-1.4: 在移动端和桌面端均显示正常，无错位
- **Notes**: 可以先在 index.html 中实现模板，其他页面复用

## [ ] Task 2: 重构首页（index.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 参考 gaoshanwen.com 首页结构
  - 顶部 Hero：品牌名 + 定位语 + 简短介绍
  - 关于灰金（精简版，带"了解更多 →"链接到 about.html）
  - 核心服务亮点（3个服务简介，带"查看详情 →"链接到 services.html）
  - 诊断入口（突出显示，引导到 diag.html）
  - 案例精选（2-3 个案例摘要，带"查看全部 →"链接到 cases.html）
  - 保持所有原有内容，但精简呈现，详情放到对应内页
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: 首页 URL `/` 可正常访问
  - `human-judgement` TR-2.2: 首页结构与 gaoshanwen.com 首页类似（简介+精选+入口）
  - `human-judgement` TR-2.3: 所有指向内页的链接均可正常跳转
- **Notes**: 首页是门面，内容要精炼，引导用户深入各内页

## [ ] Task 3: 创建关于页面（about.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 参考 gaoshanwen.com 简历页（biography）的时间线/分节结构
  - 页面标题：关于灰金
  - 品牌定位段落
  - 5 项核心能力（不良资产、企业重组、债务处置、财务分析、特殊资产投资）
  - 我们的不同（3个≠）
  - 专业团队（3 位成员卡片）
  - 全链条合作机构
  - 使命/价值主张
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: URL `/about` 可正常访问
  - `human-judgement` TR-3.2: 包含原单页中"关于灰金"板块的全部内容
  - `human-judgement` TR-3.3: 包含"我们的不同"全部内容
  - `human-judgement` TR-3.4: 包含"专业团队"全部内容
- **Notes**: 内容必须全部来自现有单页，不新增也不删减

## [ ] Task 4: 创建服务页面（services.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 参考 gaoshanwen.com 文章页的分类+列表结构
  - 页面标题：核心服务
  - 3 大服务体系：诊断顾问、陪跑顾问、重组顾问
  - 每个服务包含：目标、详细描述、适用场景
  - 服务流程（4步：诊断→方案→陪跑→攻坚）
  - 交付成果（6项交付物）
  - 底部 CTA：引导到诊断页或联系页
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: URL `/services` 可正常访问
  - `human-judgement` TR-4.2: 包含原单页中"核心服务体系"全部内容
  - `human-judgement` TR-4.3: 包含"服务流程"全部内容
  - `human-judgement` TR-4.4: 包含"交付成果"全部内容
- **Notes**: 原单页"交付成果"内容需从 PPT 第 16 页补充

## [ ] Task 5: 创建案例页面（cases.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 参考 gaoshanwen.com 书籍页的卡片式布局
  - 页面标题：成功案例
  - 3 个完整案例（建筑企业重组、资产盘活+债权协商、重度困境企业纾困）
  - 每个案例包含：标签、标题、背景、策略、成果数据
  - 案例数据统计醒目展示
  - 哪些企业适合提前介入（5类企业）
  - 底部 CTA
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: URL `/cases` 可正常访问
  - `human-judgement` TR-5.2: 包含 3 个案例的全部内容
  - `human-judgement` TR-5.3: 包含"适合提前介入的企业"内容
- **Notes**: 案例是信任状，要详细展示数据和成果

## [ ] Task 6: 更新诊断页导航（diag.html）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 保持诊断系统所有功能逻辑不变
  - 更新 header 导航，与全站统一（首页、关于、服务、案例、诊断）
  - 更新 footer，与全站统一
  - 确保 Logo、颜色、间距与其他页面一致
- **Acceptance Criteria Addressed**: AC-7, AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 诊断页导航栏包含 5 个链接
  - `human-judgement` TR-6.2: 快速体检功能正常
  - `human-judgement` TR-6.3: 全面诊断功能正常
  - `human-judgement` TR-6.4: 结果页显示正常
- **Notes**: 功能优先，绝对不能破坏诊断逻辑

## [ ] Task 7: 配置 Vercel 路由与 404 页面
- **Priority**: medium
- **Depends On**: Task 2-5
- **Description**: 
  - 更新 vercel.json，确保 clean URLs（.html 后缀可省略）
  - 更新 404.html，与全站风格一致
  - 配置各页面的路由重写规则
  - 微信验证文件保持可访问
- **Acceptance Criteria Addressed**: AC-2, AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: `/`, `/about`, `/services`, `/cases` 均返回 200
  - `programmatic` TR-7.2: 不存在的路径返回 404 页面
  - `programmatic` TR-7.3: 微信验证文件可正常访问
- **Notes**: vercel.json 中路由配置要小心，避免破坏现有 diag.html 和静态资源

## [ ] Task 8: 全量链接检查与内容完整性验证
- **Priority**: high
- **Depends On**: Task 2-7
- **Description**: 
  - 遍历所有页面，检查所有链接是否有效
  - 对照原单页内容，确保所有信息都已迁移到对应页面
  - 检查图片路径是否正确
  - 检查响应式布局在各断点下的表现
  - 确保没有"汇金"等错误品牌名称
- **Acceptance Criteria Addressed**: AC-3, AC-6, AC-8
- **Test Requirements**:
  - `programmatic` TR-8.1: 所有内部链接不返回 404
  - `human-judgement` TR-8.2: 原单页所有内容均可在新网站中找到
  - `human-judgement` TR-8.3: 移动端和桌面端布局均正常
- **Notes**: 这是质量保障的关键一步

## 任务依赖关系
- Task 2, 3, 4, 5 依赖 Task 1（但这 4 个页面之间可并行）
- Task 6 依赖 Task 1
- Task 7 依赖 Task 2-5
- Task 8 依赖所有前面的任务

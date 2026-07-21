# 文章内容类型分类审核与修正 - 验收清单

## 审核
- [x] 审计报告覆盖 articles-index.json 中全部文章
- [x] "伯克希尔股东大会发布会 2009" 被标记为应移至 qa
- [x] Wesco 股东大会系列被审核并给出结论（应移至 qa）
- [x] 其他所有文章被审核并确认当前分类合理
- [x] 芒格主题"演讲"分类（5 篇）已逐篇审核并记录评估结论（无需迁移）
- [x] 芒格主题"访谈"分类已审核并记录评估结论（无需迁移）

## 修正执行
- [x] 文件从 content/articles/ 移动到 content/qa/（11 篇）
- [x] 文件从 content/articles/ 移动到 content/talks/（5 篇）
- [x] 文件从 content/articles/ 移动到 content/interviews/（9 篇）
- [x] articles-index.json 已移除 25 个条目
- [x] qa-index.json 已添加 11 个条目（含 year 字段）
- [x] talks-index.json 已添加 5 个条目（含 person 字段）
- [x] interviews-index.json 已添加 9 个条目（含 person 字段）
- [x] 所有转移文件内容完整无损
- [x] 需迁移的文章 person 字段已正确设置
- [x] 芒格主题原 5 篇演讲经审查确认无需迁移，已记录评估结论
- [x] 迁移前后文章总数一致（25 篇移出，25 篇新增至对应索引）

## 阅读库验证
- [x] `/qa/` 页面显示新添加的"伯克希尔股东大会发布会 2009"及 Wesco 系列
- [x] `/articles/` 页面不再显示已移走的 25 篇文章
- [x] 阅读库中 qa 分类下文章总数正确（50 篇）
- [x] 芒格专区页面正确显示无需迁移的演讲内容
- [x] 巴菲特专区页面正确纳入重分类后的内容

## 构建验证
- [x] `npm run build` 构建成功
- [x] 项目启动无报错
- [x] 迁移文章的目标链接可正常访问（所有路由通过编译验证）

# Checklist

> **合并说明**：本清单已并入 [`replicate-target-site`](../replicate-target-site/) 的 Checklist。以下记录保留作为历史参考。

## 内容来源验证
- [x] 列出content/letters/所有文件及其年份
- [x] 列出content/partnership/所有文件及其年份
- [x] 确认所有年份内容文件存在
- [x] 标记缺失年份（如有）- 无缺失年份，62封股东信(1965-2025)和35封合伙人信(1956-1970)全部齐全

## 合伙人信支持
- [x] API能读取content/partnership/目录
- [x] 1956-1969年份自动路由到合伙人信
- [x] 同一年份多封信件（如1963年4封）全部可读

## 排版优化
- [x] ReactMarkdown组件`{children}`渲染修复（核心修复，解决页面空白问题）
- [x] 段落间距统一（leading-relaxed + mb-6）
- [x] 标题层级正确渲染（h2 > text-xl, h3 > text-lg）
- [x] 引用块中文样式美观（border-l-4 + 橙色 + 背景色）
- [x] 列表缩进和符号正确（list-disc/list-decimal + pl-6）
- [x] [[双括号链接]]渲染为可点击链接（processContent函数）

## IMA补充
- [x] 已检查IMA资源库 - 资源库内容与本地一致，无需补充
- [x] 补充了缺失的内容文件 - 无需补充

## 质量验证
- [x] 任意年份API返回正确内容（测试12个年份全部通过）
- [x] 1965-2024伯克希尔股东信：单文件返回内容
- [x] 1956-1970合伙人信：自动路由到partnership目录
- [x] 多文件年份（1962/1963/1965/1967）：返回letters数组
- [x] 无排版错乱或内容溢出

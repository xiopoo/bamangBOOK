# Checklist

## 诊断与准备
- [x] 已确认概念详情页 ReactMarkdown 组件缺失 `{children}`
- [x] 已确认人物详情页未读取 Markdown 文件
- [x] 已确认公司详情页样式和链接处理不一致

## 公共组件
- [x] `MarkdownContent.tsx` 已创建并支持标题、段落、引用、列表、表格、代码块
- [x] `MarkdownContent.tsx` 支持 [[双括号链接]] 转换
- [x] `MarkdownContent.tsx` 兼容暗色模式

## 概念详情页
- [x] `/concepts/{name}` 使用 `MarkdownContent` 渲染正文
- [x] 概念 Markdown 内容可见、段落间距正常
- [x] 统计卡片、相关年份区块保留

## 人物详情页
- [x] `/people/{name}` 读取 `content/people/{name}.md`
- [x] 人物 Markdown 内容可见
- [x] 文件不存在时展示友好提示
- [x] 统计卡片、别名展示保留

## 公司详情页
- [x] `/companies/{name}` 使用 `MarkdownContent` 渲染正文
- [x] 公司 Markdown 内容可见且样式统一
- [x] [[双括号链接]] 正确渲染为可点击链接

## 构建与验证
- [x] `npx next build` 无编译错误
- [x] `/concepts/内在价值`、`/people/沃伦·巴菲特`、`/companies/可口可乐` 页面可访问且内容完整


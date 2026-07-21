# Tasks

- [x] Task 1: 诊断所有内容详情页渲染问题
  - [x] SubTask 1.1: 确认概念详情页 ReactMarkdown 组件缺失 `{children}` 导致正文空白
  - [x] SubTask 1.2: 确认人物详情页未读取 `content/people/` Markdown 文件
  - [x] SubTask 1.3: 确认公司详情页未应用统一 Markdown 样式和 [[双括号链接]] 处理

- [x] Task 2: 创建公共 Markdown 渲染组件
  - [x] SubTask 2.1: 提取 `LetterReader.tsx` 中的 `markdownComponents` 为公共组件 `MarkdownContent.tsx`
  - [x] SubTask 2.2: 支持 [[双括号链接]] 转换（接收实体映射或默认 fallback 到 `/concepts/{name}`）
  - [x] SubTask 2.3: 确保组件兼容 `prose` 样式和暗色模式

- [x] Task 3: 修复概念详情页 `src/app/concepts/[name]/page.tsx`
  - [x] SubTask 3.1: 将 ReactMarkdown 内联自定义组件替换为 `MarkdownContent`
  - [x] SubTask 3.2: 保留统计卡片、相关年份区块和橙色主题
  - [x] SubTask 3.3: 验证概念 Markdown 正文正常显示

- [x] Task 4: 重构人物详情页 `src/app/people/[name]/page.tsx`
  - [x] SubTask 4.1: 读取 `content/people/{name}.md` 文件内容
  - [x] SubTask 4.2: 使用 `MarkdownContent` 渲染人物正文
  - [x] SubTask 4.3: 文件不存在时展示友好提示（保持现有占位文案）
  - [x] SubTask 4.4: 保留统计卡片、别名展示和紫色主题

- [x] Task 5: 优化公司详情页 `src/app/companies/[name]/page.tsx`
  - [x] SubTask 5.1: 将默认 ReactMarkdown 替换为 `MarkdownContent`
  - [x] SubTask 5.2: 添加 [[双括号链接]] 处理
  - [x] SubTask 5.3: 保留统计卡片、相关年份区块和蓝色主题

- [x] Task 6: 全站验证
  - [x] SubTask 6.1: 运行 `npm run build` 或 `npx next build`，确认无编译错误
  - [x] SubTask 6.2: 访问 `/concepts/内在价值`、`/people/沃伦·巴菲特`、`/companies/可口可乐` 验证渲染
  - [x] SubTask 6.3: 验证 [[双括号链接]] 渲染为可点击链接

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3、4、5 依赖 Task 2（可并行）
- Task 6 依赖 Task 3、4、5

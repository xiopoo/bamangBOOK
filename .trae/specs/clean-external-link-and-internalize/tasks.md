# Tasks

- [x] Task 1: 摸排 对标站点 系外部链接分布
  - [x] SubTask 1.1: 在项目根目录全量搜索 `learnbuffet.com`、`learnbuffett.com`、`learningbuffet.com`
  - [x] SubTask 1.2: 分类记录命中位置（内容文件、组件、配置、索引）
  - [x] SubTask 1.3: 区分"无效来源标注"与"应被内部化的实体链接"

- [x] Task 2: 移除"原文/来源"中的 对标站点 链接
  - [x] SubTask 2.1: 清理 `content/letters/*.md` 来源段落
  - [x] SubTask 2.2: 清理 `content/partnership/*.md` 来源段落
  - [x] SubTask 2.3: 清理 `content/concepts/*.md`、`content/companies/*.md`、`content/people/*.md` 来源段落
  - [x] SubTask 2.4: 检查 `content/index.json` 是否含 `learnbuffet` 字段
  - [x] SubTask 2.5: 检查组件代码中是否存在 `learnbuffet` 字符串

- [x] Task 3: 替换为内部路由
  - [x] SubTask 3.1: 编写脚本或手动将剩余指向对标网站的实体 URL 替换为 `/concepts/{name}`、`/companies/{name}`、`/people/{name}`、`/letters/{year}`、`/partnership`
  - [x] SubTask 3.2: 修正因删除"来源"段落导致的 Markdown 排版异常

- [x] Task 4: 验证
  - [x] SubTask 4.1: 全量再次搜索 `learnbuffet` 字符串，确保为 0 命中
  - [x] SubTask 4.2: 启动 prod server，对抽样页面（`/letters/2024`、`/letters/1965`、`/letters/1963`、`/concepts/内在价值`、`/partnership`、`/companies/华盛顿邮报`）curl 验证返回 200 且不再渲染 对标站点
  - [x] SubTask 4.3: 运行 `npx next build` 确认无编译错误（`Compiled successfully`、BUILD_ID `IxyPl3WsKXtk2L7ccBeLC`、26/26 静态页面生成）

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1、2
- Task 4 依赖 Task 2、3

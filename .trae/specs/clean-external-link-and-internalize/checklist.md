# Checklist

## 摸排
- [x] 已列出 `learnbuffet.com` / `learnbuffett.com` / `learningbuffet.com` 在项目内的所有命中位置
- [x] 已区分"来源标注"与"应被内部化的实体链接"

## 来源链接清理
- [x] `content/letters/*.md` 来源段落已清理
- [x] `content/partnership/*.md` 来源段落已清理
- [x] `content/concepts/*.md`、`content/companies/*.md`、`content/people/*.md` 来源段落已清理
- [x] `content/index.json` 已清理
- [x] 组件代码（`src/**`）已清理

## 内部路由替换
- [x] 实体链接已替换为 `/concepts/{name}` / `/companies/{name}` / `/people/{name}` / `/letters/{year}` / `/partnership`
- [x] Markdown 排版未因替换产生新错误

## 验证
- [x] 项目内 `learnbuffet` 全量搜索结果为 0（覆盖 `content/**/*.md` + `content/**/*.json` + `src/**/*.ts` + `src/**/*.tsx` + `package.json` + `next.config.js` + `tsconfig.json` + `crawl/*.md` + `crawl_full/*.md` + 根目录 `*.md`）
- [x] 抽样页面 `/letters/2024`、`/letters/1965`、`/letters/1963`、`/concepts/内在价值`、`/partnership`、`/companies/华盛顿邮报` 渲染不包含 `learnbuffet` 字符串（HTTP 200，HTML 全部 CLEAN）
- [x] `npx next build` 成功（`Compiled successfully`、BUILD_ID `IxyPl3WsKXtk2L7ccBeLC`、26/26 静态页面生成、退出码 0）

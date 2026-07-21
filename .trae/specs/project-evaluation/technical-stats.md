# 技术指标统计报告

## 一、TypeScript 类型检查
- 错误数: 0
- 警告数: 0
- 主要错误列表:
  无错误，类型检查通过

## 二、ESLint 检查
- 错误数: 0
- 警告数: 3
- 主要问题列表:
  1. `src/app/books/page.tsx:141` - 使用 `<img>` 可能导致较慢的 LCP 和更高的带宽，建议使用 `next/image` 的 `<Image />` 组件 (@next/next/no-img-element)
  2. `src/app/layout.tsx:21` - 自定义字体未在 `pages/_document.js` 中添加，将仅为单个页面加载 (@next/next/no-page-custom-font)
  3. `src/components/ReadingHistory.tsx:80` - React Hook useEffect 缺少依赖项 'loadData' (react-hooks/exhaustive-deps)

## 三、内容文件统计
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 股东信 | 59 | content/letters/ - 1965-2024 年巴菲特致股东信 |
| 合伙人信 | 24 | content/partnership/ - 1956-1970 年巴菲特致合伙人信 |
| 概念 | 36 | content/concepts/ - 投资概念词条 |
| 公司 | 68 | content/companies/ - 公司词条 |
| 人物 | 13 | content/people/ - 人物词条 |
| 专题文章 | 97 | content/articles/ - 各类专题文章 |
| 演讲 | 17 | content/talks/ - 演讲记录 |
| 访谈 | 31 | content/interviews/ - 访谈记录 |
| 股东大会问答 | 40 | content/qa/ - 股东大会问答与实录 |
| 书籍 | 1 | content/books/ - 书籍笔记 |
| PDF提取文件 | 264 | content/pdf-documents/ - PDF 文档提取的 Markdown 文件 |
| **总计** | **650** | （不含 PDF 提取文件为 386 个）|

## 四、代码规模
- 总文件数: 81
- 总代码行数: 7388
- tsx: 5033 行（55 个文件）
- ts: 2000 行（25 个文件）
- css: 355 行（1 个文件）

## 五、组件复用统计
| 组件 | 被引用次数 | 复用率 |
|------|-----------|--------|
| PageFooter | 20 | 高 |
| PageContainer | 20 | 高 |
| PageHeader | 15 | 高 |
| StatBadge | 15 | 高 |
| MarkdownContent | 7 | 中 |
| ArticleTableOfContents | 6 | 中 |
| FontSizeControl | 7 | 中 |
| ReadingProgress | 10 | 中 |
| RecommendationList | 2 | 低 |
| ThemeProvider | 2 | 低 |
| YearlyEvents | 2 | 低 |
| SearchBar | 2 | 低 |
| Sidebar | 1 | 低 |
| Logo | 1 | 低 |
| ThemeToggle | 1 | 低 |
| LetterReader | 1 | 低 |
| ArticleContent | 1 | 低 |
| ReadingHistory | 1 | 低 |
| RecommendationCard | 1 | 低 |
| SearchResults | 1 | 低 |
| SearchBox | 0 | 未使用 |
| SearchSuggestions | 0 | 未使用 |

## 六、死代码初查
- 疑似未使用组件: 2
  - `SearchBox.tsx` - 未在任何文件中被 import
  - `SearchSuggestions.tsx` - 未在任何文件中被 import

- 疑似孤立页面: 1
  - `/books` - 页面路由存在但未在侧边栏导航中出现

### 导航中的页面列表（共 18 个）
巴菲特区:
- /buffett (主页)
- /partnership (合伙人信)
- /letters (股东信)
- /talks (演讲)
- /interviews (访谈)
- /qa (股东大会问答)
- /articles (专题文章)

芒格区:
- /munger (查理·芒格)

工具区:
- /concepts (概念)
- /companies (公司)
- /people (人物)
- /graph (知识图谱)
- /search (搜索)
- /history (阅读历史)
- /talk (AI对话)
- /model (思维模型)
- /reading (阅读库)

其他:
- / (首页)

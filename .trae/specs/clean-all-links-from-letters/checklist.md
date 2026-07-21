# Checklist

## 清理执行
- [x] 来源引用行（`> 来源：https://learnbuffett.com/...`）已从所有 84 篇文件中删除
- [x] 原文链接行（`原文链接：https://learnbuffett.com/...`）已从所有命中文件中删除
- [x] 内联实体链接（`[文本](https://learnbuffett.com/...)`）已全部转换为纯文本
- [x] 数据来源脚注（`_数据来源：`、`_资料来源：`、`> (2) 来源：`）已删除
- [x] 分类标签行（`股东信`/`合伙人信` 独立行）已删除
- [x] SEO 描述副标题行和 HTML 标题残留行已删除
- [x] 清理后多余空行已压缩

## 验证
- [x] `content/letters/*.md` 中 `learnbuffett.com` 搜索结果为 0
- [x] `content/partnership/*.md` 中 `learnbuffett.com` 搜索结果为 0
- [x] `content/letters/*.md` 中 `^> 来源：` 搜索结果为 0
- [x] `content/partnership/*.md` 中 `^> 来源：` 搜索结果为 0
- [x] `content/letters/*.md` 中 `^原文链接：` 搜索结果为 0
- [x] `content/partnership/*.md` 中 `^原文链接：` 搜索结果为 0
- [x] 抽样检查 10 篇文件的正文完整性和排版无异常

## 构建
- [x] `npm run build` 执行成功，无编译错误
- [x] 索引文件 wordCount 字段值未受影响

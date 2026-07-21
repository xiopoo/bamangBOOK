# 标准化信件替换 - 验收清单

## 用户上传
- [ ] 股东信标准化文件已放入 `upload/letters/` 目录
- [ ] 合伙人信标准化文件已放入 `upload/partnership/` 目录

## 文件检测与映射
- [ ] 上传文件列表已读取
- [ ] 每个文件已识别对应年份
- [ ] 文件名映射表已生成供用户确认

## 文件替换
- [ ] 旧文件已备份（可选）
- [ ] 上传文件已成功复制到 `content/letters/` 和 `content/partnership/`
- [ ] 合伙人信文件名格式统一为 `partnership_{year}-{type}-巴菲特致合伙人信.md`
- [ ] 股东信文件名格式统一为 `berkshire_{year}-巴菲特致股东信.md`
- [ ] `upload/` 目录源文件已清理

## 格式清洗与标准化
- [ ] 所有替换文件首行以 `# ` 开头
- [ ] 所有文件编码为 UTF-8（无 BOM）
- [ ] 信件结尾符合 letter-ending-cleanup 标准（以"沃伦·巴菲特"署名结束）

## 索引更新
- [ ] `content/partnership-index.json` 中的 wordCount 已更新
- [ ] `content/letters-index.json` 中的 wordCount 已更新
- [ ] title、year、fileName、person 等字段保持不变

## 构建验证
- [ ] `npm run build` 执行成功
- [ ] 合伙人信 1957 年详情页可正常访问
- [ ] 合伙人信 1961 年（mid-year + annual）详情页可正常访问
- [ ] 股东信 1965 年详情页可正常访问
- [ ] 股东信 2024 年详情页可正常访问
- [ ] 信件内容完整显示，无乱码

/**
 * 日期格式化工具
 *
 * gray-matter 会把 YAML 的 `date: 2024-03-08` 解析成 JS Date 对象，
 * 直接 `String(date)` 会得到 "Fri Mar 08 2024 ..." 这种英文格式。
 * 这里统一把 Date 对象 / 字符串 / 数字规范成 YYYY-MM-DD。
 */

/** 把 Date 对象或日期字符串规范成 YYYY-MM-DD；无法解析返回 null。 */
export function formatDateValue(value: unknown): string | null {
  if (value == null || value === '') return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // 用本地时区拼 YYYY-MM-DD，避免 toISOString 因 UTC 偏移导致日期偏差
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const str = String(value).trim()
  if (!str) return null
  // 已是 YYYY-MM-DD 形式
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
  // YYYY/MM/DD 或 YYYY.MM.DD
  const m = str.match(/^(\d{4})[\/.年](\d{1,2})[\/.月](\d{1,2})/)
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  }
  // 纯年份
  const y = str.match(/^(\d{4})/)
  if (y) return `${y[1]}-01-01`
  return null
}

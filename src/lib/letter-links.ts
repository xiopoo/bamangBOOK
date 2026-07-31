export function getLetterArchiveHref(year: number | string): string {
  const numericYear = Number(year)
  return Number.isFinite(numericYear) && numericYear < 1965
    ? '/partnership'
    : `/letters/${year}`
}

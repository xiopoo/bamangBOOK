export type BerkshireSourceFormat = 'pdf' | 'html' | 'archive'

export interface BerkshireShareholderSource {
  url: string
  format: BerkshireSourceFormat
  label: string
  description: string
}

const LETTERS_BASE_URL = 'https://www.berkshirehathaway.com/letters'

export function getBerkshireShareholderSource(year: number): BerkshireShareholderSource | null {
  if (year === 2025) {
    return {
      url: 'https://www.berkshirehathaway.com/news/nov1025.pdf',
      format: 'pdf',
      label: '官方新闻稿 PDF',
      description: '伯克希尔官网发布的 2025 年感恩节股东寄语英文原文',
    }
  }

  if (year >= 2004 && year <= 2024) {
    return {
      url: `${LETTERS_BASE_URL}/${year}ltr.pdf`,
      format: 'pdf',
      label: '英文原文 PDF',
      description: `伯克希尔官网发布的 ${year} 年股东信英文 PDF`,
    }
  }

  if (year >= 1977 && year <= 2003) {
    return {
      url: `${LETTERS_BASE_URL}/${year}.html`,
      format: 'html',
      label: '英文原文 HTML',
      description: `伯克希尔官网提供的 ${year} 年股东信英文网页版`,
    }
  }

  if (year >= 1965 && year <= 1976) {
    return {
      url: `${LETTERS_BASE_URL}/letters.html`,
      format: 'archive',
      label: '官网档案说明',
      description: '伯克希尔官网未提供该年份的单独在线原文；官方档案说明其已收入完整信件汇编',
    }
  }

  return null
}

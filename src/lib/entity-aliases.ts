export const PEOPLE_ALIAS_MAP: Record<string, string[]> = {
  '沃伦·巴菲特': ['巴菲特', 'Buffett', 'Warren Buffett'],
  '查理·芒格': ['芒格', 'Munger', 'Charlie Munger'],
  '本杰明·格雷厄姆': ['格雷厄姆', 'Graham', 'Benjamin Graham'],
  '格雷格·阿贝尔': ['Greg Abel', 'Abel', '阿贝尔'],
  '汤姆·墨菲': ['Tom Murphy'],
  '菲尔·费雪': ['费雪', 'Fisher', 'Philip Fisher'],
  '皮特·利格尔': ['Pete Liegl'],
}

export function resolvePersonCanonicalName(id: string): string {
  for (const [canonical, aliases] of Object.entries(PEOPLE_ALIAS_MAP)) {
    if (canonical === id || aliases.includes(id)) return canonical
  }
  return id
}

export const CONCEPT_ALIAS_MAP: Record<string, string> = {
  GAAP: '通用会计准则',
  ROE: '净资产收益率',
}

export function resolveConceptCanonicalName(id: string): string {
  return CONCEPT_ALIAS_MAP[id] || id
}

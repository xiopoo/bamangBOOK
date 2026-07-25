import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import PersonHeader from '@/components/PersonHeader'
import { people, getRelatedPeople } from '@/lib/people'
import { countDocumentsByPerson } from '@/lib/documents'
import { getModelsByDiscipline, getModelStats } from '@/lib/models'
import MungerContent from './MungerContent'

const person = people.munger
const relatedPeople = getRelatedPeople('munger')

const mungerTalksCount = countDocumentsByPerson('talks', 'munger')
const mungerQaCount = countDocumentsByPerson('qa', 'munger')
const modelGroups = getModelsByDiscipline()
const modelStats = getModelStats()

export default function MungerPage() {
  return (
    <PageContainer maxWidth="5xl">
      <PersonHeader
        person={person}
        stats={{
          talks: mungerTalksCount,
          qa: mungerQaCount,
        }}
      />

      <MungerContent
        person={person}
        relatedPeople={relatedPeople}
        talksCount={mungerTalksCount}
        qaCount={mungerQaCount}
        modelGroups={modelGroups}
        modelStats={modelStats}
      />

      <PageFooter />
    </PageContainer>
  )
}
import { readdirSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import PersonHeader from '@/components/PersonHeader'
import { people, getRelatedPeople } from '@/lib/people'
import { countDocumentsByPerson } from '@/lib/documents'
import BuffettContent from './BuffettContent'

const person = people.buffett
const relatedPeople = getRelatedPeople('buffett')

const lettersDir = path.join(process.cwd(), 'content/letters')
const partnershipDir = path.join(process.cwd(), 'content/partnership')

const partnershipCount = readdirSync(partnershipDir).filter(f => f.endsWith('.md')).length
const shareholderCount = readdirSync(lettersDir).filter(f => f.endsWith('.md')).length

const shareholderFiles = readdirSync(lettersDir).filter(f => f.endsWith('.md'))
const shareholderYears = shareholderFiles.map(f => {
  const match = f.match(/berkshire_(\d{4})/)
  return match ? parseInt(match[1]) : 0
}).filter(y => y > 0)
const minShareholderYear = Math.min(...shareholderYears)
const maxShareholderYear = Math.max(...shareholderYears)

const buffettTalksCount = countDocumentsByPerson('talks', 'buffett')
const buffettInterviewsCount = countDocumentsByPerson('interviews', 'buffett')
const buffettQaCount = countDocumentsByPerson('qa', 'buffett')

export default function BuffettPage() {
  return (
    <PageContainer maxWidth="6xl">
      <PersonHeader
        person={person}
        stats={{
          letters: shareholderCount,
          partnerships: partnershipCount,
          talks: buffettTalksCount,
          interviews: buffettInterviewsCount,
          qa: buffettQaCount,
        }}
      />

      <BuffettContent
        person={person}
        relatedPeople={relatedPeople}
        partnershipCount={partnershipCount}
        shareholderCount={shareholderCount}
        minShareholderYear={minShareholderYear}
        maxShareholderYear={maxShareholderYear}
        talksCount={buffettTalksCount}
        interviewsCount={buffettInterviewsCount}
      />

      <PageFooter />
    </PageContainer>
  )
}
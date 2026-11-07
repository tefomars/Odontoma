import { CITO_II_THIRD_PARTIAL } from "./citoIII"
import { studioBanks } from "../studio/catalog"
import { reviewClassPresentation } from "../appBuilder/organization"
import { createCumulativePrePartial, isCumulativePrePartial } from "./cumulative"

export const prePartialBanks = studioBanks.filter(bank => bank.kind === "prepartial" && bank.enabled !== false)

export const cumulativePrePartialBanks = [...new Set(prePartialBanks.map(bank => bank.subject))].flatMap(subject => {
  const presentation = reviewClassPresentation(subject)
  if (presentation.finalExamEnabled === false) return []
  const bank = createCumulativePrePartial(prePartialBanks, subject, presentation.finalExamTitle, presentation.title)
  return bank ? [bank] : []
})

// Session lookup includes derived finals; the normal list and its counts do not.
export const prePartialSessionBanks = [...prePartialBanks, ...cumulativePrePartialBanks]

export function getCumulativePrePartialBank(subject: string) {
  return cumulativePrePartialBanks.find(bank => bank.subject === subject)
}

export function getCumulativeQuestionTitle(bankId: string, chapterId: string): string | undefined {
  const bank = getPrePartialBank(bankId.replace(/^bank:/, ""))
  if (!bank || !isCumulativePrePartial(bank.id)) return undefined
  const chapter = bank.chapters.find(item => item.id === chapterId)
  return `${bank.title} · ${chapter?.title || chapterId}`
}

export function getPrePartialBank(id: string) {
  // La etiqueta anterior puede permanecer en una sesión de examen guardada.
  const currentId = id === "Parcial 3 · Cito III" ? CITO_II_THIRD_PARTIAL : id
  return prePartialSessionBanks.find(bank => bank.id === currentId)
}

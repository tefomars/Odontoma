import { citoIIPrePartialFlashcards, citoIIPrePartialQuestions } from "./citoII"
import { CITO_III_PARTIAL, citoIIIPrePartialQuestions } from "./citoIII"
import { citoIIIPrePartialFlashcards } from "./citoIIIFlashcards"

export const prePartialBanks = [
  {
    id: "Parcial 2 · Cito II",
    questions: citoIIPrePartialQuestions,
    flashcards: citoIIPrePartialFlashcards
  },
  {
    id: CITO_III_PARTIAL,
    questions: citoIIIPrePartialQuestions,
    flashcards: citoIIIPrePartialFlashcards
  }
]

export function getPrePartialBank(id: string) {
  return prePartialBanks.find(bank => bank.id === id)
}

import { citoIIPrePartialFlashcards, citoIIPrePartialQuestions } from "./citoII"
import { CITO_II_THIRD_PARTIAL, citoIIIPrePartialQuestions } from "./citoIII"
import { citoIIIPrePartialFlashcards } from "./citoIIIFlashcards"

export const prePartialBanks = [
  {
    id: "Parcial 2 · Cito II",
    questions: citoIIPrePartialQuestions,
    flashcards: citoIIPrePartialFlashcards
  },
  {
    id: CITO_II_THIRD_PARTIAL,
    questions: citoIIIPrePartialQuestions,
    flashcards: citoIIIPrePartialFlashcards
  }
]

export function getPrePartialBank(id: string) {
  // La etiqueta anterior puede permanecer en una sesión de examen guardada.
  const currentId = id === "Parcial 3 · Cito III" ? CITO_II_THIRD_PARTIAL : id
  return prePartialBanks.find(bank => bank.id === currentId)
}

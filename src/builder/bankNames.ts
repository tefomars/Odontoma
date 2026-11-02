import type { HomeContent, FlashcardSubjectBlock } from "@/content/appBuilder/types"

export function syncBankAccessNames(home: HomeContent, decks: FlashcardSubjectBlock[], bankId: string, title: string) {
  const matches = (destination: string) => destination === bankId || destination === `bank:${bankId}` || destination === `flashcard-bank:${bankId}`
  return { home: { ...home, subjects: home.subjects.map(c => matches(c.destination) ? { ...c, title } : c) }, decks: decks.map(c => matches(c.destination) ? { ...c, title } : c) }
}

import type { HomeContent, FlashcardSubjectBlock } from "../appBuilder/types.ts"
import type { StudyBank } from "./schema.ts"

/** Register a new bank once when saved, never recreate cards removed by their owner. */
export function registerNewCourseCards(home: HomeContent, decks: FlashcardSubjectBlock[], beforeIds: Set<string>, banks: StudyBank[]) {
  const subjects = [...home.subjects]
  const cards = [...decks]
  for (const bank of banks) {
    if (beforeIds.has(bank.id) || bank.kind !== "course" || bank.archived || bank.enabled === false) continue
    const destination = `bank:${bank.id}` as const
    if (!subjects.some(s => s.destination === destination)) subjects.push({ id: bank.id, title: bank.title, subtitle: "", status: "Disponible", accentColor: "#8b5cf6", destination })
    if (!cards.some(s => s.destination === destination)) cards.push({ id: bank.id, title: bank.title, subtitle: "FLASHCARDS", description: "Elegí un capítulo para estudiar.", accent: "from-violet-500/20 to-sky-500/20", accentColor: "#8b5cf6", destination })
  }
  return { home: { ...home, subjects }, decks: cards }
}

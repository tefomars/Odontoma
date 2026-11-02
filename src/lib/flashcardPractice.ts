import type { Flashcard } from "@/content/flashcards/histologia/cards"
import type { FsrsStorage } from "./fsrs"
import type { FlashcardSource } from "./flashcardDecks"

export type FlashcardStudyMode = "fsrs" | "free"
export function selectFlashcardScope(cards: Flashcard[], source: FlashcardSource, topic: string, subtopic?: string) {
  if (source === "user") return cards
  if (subtopic?.startsWith("__subtopics:")) {
    const names = subtopic.slice("__subtopics:".length).split("||").filter(Boolean)
    return cards.filter(c => c.chapter === topic && names.includes(c.subtopic))
  }
  if (subtopic) return cards.filter(c => c.topic === topic && c.subtopic === subtopic)
  if (topic === "all" || topic === "__reviewed_due") return cards
  return cards.some(c => c.chapter === topic) ? cards.filter(c => c.chapter === topic) : cards.filter(c => c.topic === topic)
}
export function selectFlashcardPreference(cards: Flashcard[], storage: FsrsStorage, preference: "new" | "incorrect" | "mixed", topic = "all", now = Date.now(), ignoreCooldown = false) {
  if (topic === "__reviewed_due") return cards.filter(c => storage.cards[c.id] && (ignoreCooldown || new Date(storage.cards[c.id].dueDate).getTime() <= now))
  if (preference === "new") return cards.filter(c => !storage.cards[c.id])
  if (preference === "incorrect") {
    const ids = new Set(storage.reviews.filter(r => r.rating === "again").map(r => r.cardId))
    return cards.filter(c => ids.has(c.id))
  }
  return cards
}
export type FreeReviewFrame = { queue: string[]; cursor: number }
export type FreeReviewSession = FreeReviewFrame & { past: FreeReviewFrame[] }
export const createFreeReview = (ids: string[]): FreeReviewSession => ({ queue: [...ids], cursor: 0, past: [] })
export function advanceFreeReview(state: FreeReviewSession, repeat: boolean): FreeReviewSession {
  const id = state.queue[state.cursor]
  if (!id) return state
  return { queue: repeat ? [...state.queue, id] : state.queue, cursor: state.cursor + 1, past: [...state.past, { queue: state.queue, cursor: state.cursor }].slice(-100) }
}
export function undoFreeReview(state: FreeReviewSession): FreeReviewSession {
  const previous = state.past.at(-1)
  return previous ? { ...previous, past: state.past.slice(0, -1) } : state
}

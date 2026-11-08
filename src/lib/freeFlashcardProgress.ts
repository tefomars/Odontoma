import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { notifyStudyProgress } from "./studyProgressEvents"

export const FREE_FLASHCARD_PROGRESS_KEY = "odontoma_free_flashcard_progress_v1"
export type FreeFlashcardResult = { status: "incorrect" | "completed"; reviewedAt: string }
export type FreeFlashcardProgress = Record<string, FreeFlashcardResult>

export function loadFreeFlashcardProgress(): FreeFlashcardProgress {
  try {
    const raw = localStorage.getItem(FREE_FLASHCARD_PROGRESS_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) =>
      value && typeof value === "object" &&
      (value.status === "incorrect" || value.status === "completed") &&
      typeof value.reviewedAt === "string"
    ))
  } catch { return {} }
}

/** Update only this card, preserving progress in other decks and tabs. */
export function saveFreeFlashcardResult(cardId: string, result?: FreeFlashcardResult) {
  const progress = loadFreeFlashcardProgress()
  if (result) progress[cardId] = result
  else delete progress[cardId]
  localStorage.setItem(FREE_FLASHCARD_PROGRESS_KEY, JSON.stringify(progress))
  notifyStudyProgress(FREE_FLASHCARD_PROGRESS_KEY)
  return progress
}

/** Reset only the requested scope. This never touches FSRS or suspension. */
export function resetFreeFlashcardProgress(cardIds: string[]) {
  const progress = loadFreeFlashcardProgress()
  for (const id of cardIds) delete progress[id]
  localStorage.setItem(FREE_FLASHCARD_PROGRESS_KEY, JSON.stringify(progress))
  notifyStudyProgress(FREE_FLASHCARD_PROGRESS_KEY)
  return progress
}

export function selectFreeFlashcards(cards: Flashcard[], progress: FreeFlashcardProgress, preference: "new" | "incorrect" | "mixed") {
  return cards.filter(card => {
    const result = progress[card.id]
    if (preference === "new") return !result
    if (preference === "incorrect") return result?.status === "incorrect"
    return result?.status !== "completed"
  })
}

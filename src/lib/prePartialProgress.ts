import type { StudyBank } from "@/content/studio/schema"
import type { FlashcardStudyMode } from "./flashcardPractice"
import { selectFlashcardPreference } from "./flashcardPractice"
import { loadStats } from "./stats"
import { loadFsrsStorage } from "./flashcardStorage"
import { loadFreeFlashcardProgress, selectFreeFlashcards } from "./freeFlashcardProgress"
import { writeBrowserStorage } from "./storageSafety"

export type ReviewPreference = "new" | "incorrect" | "mixed"
export type ReviewKind = "questions" | "flashcards"
export const PREPARTIAL_PREFERENCES_KEY = "odontoma_prepartial_preferences_v1"

export function loadPrePartialPreferences(): Record<string, ReviewPreference> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(PREPARTIAL_PREFERENCES_KEY) || "{}")
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
    return Object.fromEntries(Object.entries(raw).filter(([, value]) => typeof value === "string" && ["new", "incorrect", "mixed"].includes(value))) as Record<string, ReviewPreference>
  } catch { return {} }
}

export function prePartialPreferenceKey(bankId: string, kind: ReviewKind) {
  return JSON.stringify([kind, bankId])
}

export function savePrePartialPreference(bankId: string, kind: ReviewKind, preference: ReviewPreference) {
  // Merge with storage so changing one partial never replaces another tab's preferences.
  return writeBrowserStorage(PREPARTIAL_PREFERENCES_KEY, JSON.stringify({
    ...loadPrePartialPreferences(), [prePartialPreferenceKey(bankId, kind)]: preference,
  }))
}

export function readPrePartialProgress(kind: ReviewKind, mode: FlashcardStudyMode) {
  return {
    questions: kind === "questions" ? loadStats().questions : {},
    free: kind === "flashcards" && mode === "free" ? loadFreeFlashcardProgress() : {},
    fsrs: kind === "flashcards" && mode === "fsrs" ? loadFsrsStorage() : { cards: {}, reviews: [] },
  }
}

/** Count unique items in the CURRENT bank, never answer attempts or removed content. */
export function countPrePartialProgress(
  bank: Pick<StudyBank, "questions" | "flashcards">,
  kind: ReviewKind,
  mode: FlashcardStudyMode,
  progress: ReturnType<typeof readPrePartialProgress>,
) {
  if (kind === "questions") {
    const questions = [...new Map(bank.questions.map(q => [q.id, q])).values()]
    const done = questions.filter(q => (progress.questions[q.id]?.correct || 0) + (progress.questions[q.id]?.incorrect || 0) > 0).length
    return { total: questions.length, done, new: questions.length - done,
      incorrect: questions.filter(q => (progress.questions[q.id]?.incorrect || 0) > 0).length }
  }
  const cards = [...new Map(bank.flashcards.map(c => [c.id, c])).values()]
  const unseen = mode === "free"
    ? selectFreeFlashcards(cards, progress.free, "new").length
    : selectFlashcardPreference(cards, progress.fsrs, "new").length
  return { total: cards.length, done: cards.length - unseen, new: unseen,
    incorrect: mode === "free"
      ? selectFreeFlashcards(cards, progress.free, "incorrect").length
      : selectFlashcardPreference(cards, progress.fsrs, "incorrect").length }
}

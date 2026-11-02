import { useSyncExternalStore } from "react"
import type { FlashcardStudyMode } from "./flashcardPractice"
const KEY = "odontoma_flashcard_study_mode_v1"
const EVENT = "odontoma-flashcard-study-mode"
let fallback: FlashcardStudyMode = "fsrs"
export function getFlashcardStudyMode(): FlashcardStudyMode {
  try { const value = localStorage.getItem(KEY); return value === "free" ? "free" : value === "fsrs" ? "fsrs" : fallback } catch { return fallback }
}
export function setFlashcardStudyMode(mode: FlashcardStudyMode) {
  fallback = mode
  try { localStorage.setItem(KEY, mode) } catch { /* Mode still works for this page if storage is full. */ }
  window.dispatchEvent(new Event(EVENT))
}
function subscribe(callback: () => void) {
  const storage = (e: StorageEvent) => { if (!e.key || e.key === KEY) callback() }
  window.addEventListener(EVENT, callback); window.addEventListener("storage", storage)
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", storage) }
}
export function useFlashcardStudyMode() {
  const mode = useSyncExternalStore(subscribe, getFlashcardStudyMode, () => "fsrs" as const)
  return [mode, setFlashcardStudyMode] as const
}

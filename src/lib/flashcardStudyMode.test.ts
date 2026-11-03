import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { getFlashcardStudyMode, setFlashcardStudyMode } from "./flashcardStudyMode"

describe("preferencia persistente de modo de flashcards", () => {
  beforeEach(() => {
    installLocalStorageMock()
    vi.stubGlobal("window", new EventTarget())
    setFlashcardStudyMode("fsrs")
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it("conserva la misma clave y respeta una preferencia libre ya guardada", () => {
    localStorage.setItem("odontoma_flashcard_study_mode_v1", "free")
    expect(getFlashcardStudyMode()).toBe("free")
  })

  it("persiste ambos modos y avisa a las otras pantallas de la app", () => {
    const listener = vi.fn()
    window.addEventListener("odontoma-flashcard-study-mode", listener)
    setFlashcardStudyMode("free")
    expect(getFlashcardStudyMode()).toBe("free")
    expect(localStorage.getItem("odontoma_flashcard_study_mode_v1")).toBe("free")
    setFlashcardStudyMode("fsrs")
    expect(getFlashcardStudyMode()).toBe("fsrs")
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("no reinicia ni modifica progreso FSRS, avance libre o suspensiones", () => {
    const values = {
      odontoma_fsrs_storage: JSON.stringify({ cards: { previous: { reviewCount: 4 } }, reviews: [] }),
      odontoma_free_flashcard_progress_v1: JSON.stringify({ previous: { status: "completed", reviewedAt: "2026-11-03" } }),
      odontoma_suspended_flashcards: '["suspended"]',
    }
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value)
    setFlashcardStudyMode("free")
    setFlashcardStudyMode("fsrs")
    for (const [key, value] of Object.entries(values)) expect(localStorage.getItem(key)).toBe(value)
  })
})

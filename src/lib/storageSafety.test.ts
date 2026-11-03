import { beforeEach, describe, expect, it, vi } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { saveFsrsStorage } from "./flashcardStorage"
import { saveOpenQuizProgress } from "./openQuizProgress"
import { saveQuizAttempt, type QuizAttempt } from "./quizHistory"
import { dismissStorageFailure, storageFailure } from "./storageSafety"

describe("storage quota failures", () => {
  beforeEach(() => { installLocalStorageMock(); dismissStorageFailure() })
  it("reports failure without claiming that a review or exam was saved", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota") })
    expect(saveFsrsStorage({ cards: {}, reviews: [] })).toBe(false)
    expect(saveOpenQuizProgress({ deckId: "test", questionIds: [], current: 0, savedAt: "now" })).toBe(false)
    const attempt: QuizAttempt = { id: "attempt", subject: "test", title: "test", completedAt: "now", responses: [], total: 0, score: 0 }
    expect(saveQuizAttempt(attempt)).toBeNull()
    expect(storageFailure()).toContain("No se pudo guardar")
    expect(localStorage.length).toBe(0)
    vi.restoreAllMocks()
  })
})

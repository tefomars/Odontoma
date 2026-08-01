import { beforeEach, describe, expect, it } from "vitest"

import { installLocalStorageMock } from "@/test/localStorageMock"
import {
  clearOpenQuizProgress,
  loadOpenQuizProgress,
  saveOpenQuizProgress
} from "./openQuizProgress"

describe("open quiz progress", () => {
  beforeEach(() => installLocalStorageMock())

  it("keeps independent progress for each deck", () => {
    saveOpenQuizProgress({
      deckId: "deck-a",
      questionIds: ["a-1"],
      current: 0,
      studentAnswer: "Mi respuesta",
      revealed: false,
      grades: { incorrect: 0, partial: 0, correct: 0 },
      responses: [],
      savedAt: "2026-08-01T00:00:00.000Z"
    })
    saveOpenQuizProgress({
      deckId: "deck-b",
      questionIds: ["b-1"],
      current: 0,
      studentAnswer: "Otra respuesta",
      revealed: true,
      grades: { incorrect: 0, partial: 0, correct: 0 },
      responses: [],
      savedAt: "2026-08-01T00:01:00.000Z"
    })

    clearOpenQuizProgress("deck-a")

    expect(loadOpenQuizProgress("deck-a")).toBeNull()
    expect(loadOpenQuizProgress("deck-b")?.studentAnswer).toBe("Otra respuesta")
  })
})

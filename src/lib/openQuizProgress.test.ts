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
      answers: { "a-1": "Mi respuesta" },
      revealedQuestionIds: [],
      gradesByQuestion: {},
      savedAt: "2026-08-01T00:00:00.000Z"
    })
    saveOpenQuizProgress({
      deckId: "deck-b",
      questionIds: ["b-1"],
      current: 0,
      answers: { "b-1": "Otra respuesta" },
      revealedQuestionIds: ["b-1"],
      gradesByQuestion: { "b-1": "partial" },
      savedAt: "2026-08-01T00:01:00.000Z"
    })

    clearOpenQuizProgress("deck-a")

    expect(loadOpenQuizProgress("deck-a")).toBeNull()
    expect(loadOpenQuizProgress("deck-b")?.answers?.["b-1"]).toBe("Otra respuesta")
    expect(loadOpenQuizProgress("deck-b")?.revealedQuestionIds).toEqual(["b-1"])
    expect(loadOpenQuizProgress("deck-b")?.gradesByQuestion).toEqual({ "b-1": "partial" })
  })
})

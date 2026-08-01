import { beforeEach, describe, expect, it } from "vitest"

import { installLocalStorageMock } from "@/test/localStorageMock"
import {
  loadQuizHistory,
  QUIZ_HISTORY_KEY,
  saveQuizAttempt,
  type QuizAttempt
} from "./quizHistory"

function attempt(index: number): QuizAttempt {
  return {
    id: `attempt-${index}`,
    title: "Histología",
    subject: "histologia",
    completedAt: new Date(2026, 0, index).toISOString(),
    score: index,
    total: 10,
    responses: []
  }
}

describe("quiz history", () => {
  beforeEach(() => installLocalStorageMock())

  it("keeps only the three most recent attempts", () => {
    saveQuizAttempt(attempt(1))
    saveQuizAttempt(attempt(2))
    saveQuizAttempt(attempt(3))
    saveQuizAttempt(attempt(4))

    expect(loadQuizHistory().map(item => item.id)).toEqual([
      "attempt-4",
      "attempt-3",
      "attempt-2"
    ])
  })

  it("recovers safely from invalid storage", () => {
    localStorage.setItem(QUIZ_HISTORY_KEY, "{invalid")
    expect(loadQuizHistory()).toEqual([])
  })
})

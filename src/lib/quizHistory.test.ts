import { beforeEach, describe, expect, it } from "vitest"

import { installLocalStorageMock } from "@/test/localStorageMock"
import {
  loadQuizHistory,
  QUIZ_HISTORY_KEY,
  removeQuizAttempt,
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

  it("keeps only the seven most recent attempts", () => {
    for (let index = 1; index <= 8; index += 1) {
      saveQuizAttempt(attempt(index))
    }

    expect(loadQuizHistory().map(item => item.id)).toEqual([
      "attempt-8",
      "attempt-7",
      "attempt-6",
      "attempt-5",
      "attempt-4",
      "attempt-3",
      "attempt-2"
    ])
  })

  it("keeps seven attempts independently for each quiz mode", () => {
    for (let index = 1; index <= 8; index += 1) {
      saveQuizAttempt({
        ...attempt(index),
        id: `multiple-${index}`,
        mode: "multiple-choice"
      })

      saveQuizAttempt({
        ...attempt(index),
        id: `open-${index}`,
        mode: "open-ended"
      })
    }

    const history = loadQuizHistory()
    const multipleChoice = history.filter(item => item.mode === "multiple-choice")
    const openEnded = history.filter(item => item.mode === "open-ended")

    expect(multipleChoice).toHaveLength(7)
    expect(openEnded).toHaveLength(7)
    expect(multipleChoice.map(item => item.id)).not.toContain("multiple-1")
    expect(openEnded.map(item => item.id)).not.toContain("open-1")
  })

  it("recovers safely from invalid storage", () => {
    localStorage.setItem(QUIZ_HISTORY_KEY, "{invalid")
    expect(loadQuizHistory()).toEqual([])
  })

  it("removes only the selected attempt", () => {
    saveQuizAttempt(attempt(1))
    saveQuizAttempt(attempt(2))

    removeQuizAttempt("attempt-2")

    expect(loadQuizHistory().map(item => item.id)).toEqual(["attempt-1"])
  })
})

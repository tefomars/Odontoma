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

  it("muestra el nombre correcto del tercer parcial en intentos antiguos", () => {
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify([{
      ...attempt(1),
      title: "Parcial 3 · Cito III",
      responses: [{
        questionId: "quiz-cito3-01",
        question: "Pregunta",
        chapter: "Parcial 3 · Cito III",
        selectedAnswers: [],
        correctAnswers: ["Respuesta"],
        isCorrect: false,
        questionSnapshot: {
          id: "quiz-cito3-01",
          chapter: "Parcial 3 · Cito III",
          type: "single",
          question: "Pregunta",
          options: ["Respuesta", "Otra"],
          correctAnswers: [0]
        }
      }]
    }]))

    const [saved] = loadQuizHistory()
    expect(saved.title).toBe("Parcial 3 · Cito II")
    expect(saved.responses[0].chapter).toBe("Parcial 3 · Cito II")
    expect(saved.responses[0].questionSnapshot?.chapter).toBe("Parcial 3 · Cito II")
  })
})

import { describe, expect, it } from "vitest"

import {
  getPracticeQuestionIds,
  getProgressSummary,
  getQuestionProgress
} from "@/lib/quizProgress"

describe("quizProgress", () => {
  it("no considera sólida una pregunta acertada una sola vez", () => {
    expect(getQuestionProgress({ correct: 1, incorrect: 0 }).state)
      .toBe("learning")
  })

  it("usa la evidencia reciente y permite recuperarse de errores antiguos", () => {
    expect(getQuestionProgress({
      correct: 4,
      incorrect: 2,
      recent: [false, true, true, true],
      lastCorrect: true,
      correctStreak: 3
    }).state).toBe("solid")
  })

  it("separa cobertura, precisión y solidez", () => {
    const questions = [
      { id: "solid", chapter: "Capítulo 1" },
      { id: "weak", chapter: "Capítulo 1" },
      { id: "new", chapter: "Capítulo 1" }
    ]
    const stats = {
      totalAnswered: 4,
      totalCorrect: 3,
      tags: {},
      questions: {
        solid: {
          correct: 2,
          incorrect: 0,
          recent: [true, true],
          lastCorrect: true,
          correctStreak: 2
        },
        weak: {
          correct: 1,
          incorrect: 1,
          recent: [true, false],
          lastCorrect: false,
          correctStreak: 0
        }
      }
    }

    expect(getProgressSummary(questions, stats)).toMatchObject({
      coverage: 66.7,
      solid: 1,
      weak: 1,
      unseen: 1
    })
    expect(getPracticeQuestionIds(questions, stats, "recent"))
      .toEqual(["weak"])
  })
})

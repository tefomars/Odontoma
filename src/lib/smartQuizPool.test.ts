import { describe, expect, it } from "vitest"

import {
  buildSmartQuizPool
} from "@/lib/smartQuizPool"

describe("buildSmartQuizPool", () => {
  it("prioriza falladas recientes y nuevas sin castigar errores antiguos para siempre", () => {
    const questions = [
      { id: "recent-error" },
      { id: "new" },
      { id: "correct" },
      { id: "recovered" },
      { id: "recent-error" }
    ]

    const result = buildSmartQuizPool(questions, {
      "recent-error": {
        correct: 2,
        incorrect: 1,
        recent: [true, true, false],
        lastCorrect: false,
        correctStreak: 0
      },
      recovered: {
        correct: 3,
        incorrect: 1,
        recent: [false, true, true],
        lastCorrect: true,
        correctStreak: 2
      },
      correct: {
        correct: 3,
        incorrect: 0,
        recent: [true, true, true],
        lastCorrect: true,
        correctStreak: 3
      }
    })

    expect(result.map(question => question.id)).toEqual([
      "recent-error",
      "new",
      "recovered",
      "correct"
    ])
  })
})

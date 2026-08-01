import { describe, expect, it } from "vitest"

import {
  buildSmartQuizPool
} from "@/lib/smartQuizPool"

describe("buildSmartQuizPool", () => {
  it("prioriza falladas y no duplica preguntas con historial mixto", () => {
    const questions = [
      { id: "mixed" },
      { id: "new" },
      { id: "correct" },
      { id: "mixed" }
    ]

    const result = buildSmartQuizPool(questions, {
      mixed: { correct: 2, incorrect: 1 },
      correct: { correct: 3, incorrect: 0 }
    })

    expect(result.map(question => question.id)).toEqual([
      "mixed",
      "new",
      "correct"
    ])
  })
})

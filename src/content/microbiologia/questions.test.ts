import { describe, expect, it } from "vitest"

import { questions, questionCountsByChapter } from "."

describe("microbiology quizzes", () => {
  it("contains complete chapter banks", () => {
    expect(questionCountsByChapter["Capítulo 18"]).toBeGreaterThanOrEqual(40)
    expect(questionCountsByChapter["Capítulo 20"]).toBeGreaterThanOrEqual(50)
    expect(questions).toHaveLength(
      questionCountsByChapter["Capítulo 18"] + questionCountsByChapter["Capítulo 20"]
    )
  })

  it("uses valid questions and unique identifiers", () => {
    expect(new Set(questions.map(question => question.id)).size).toBe(questions.length)
    for (const question of questions) {
      expect(question.question.trim().length).toBeGreaterThan(10)
      expect(question.options.length === 2 || question.options.length === 4).toBe(true)
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(question.correctAnswers).toHaveLength(1)
      expect(question.correctAnswers[0]).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswers[0]).toBeLessThan(question.options.length)
      expect(question.explanation.trim().length).toBeGreaterThan(15)
    }
  })
})

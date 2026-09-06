import { describe, expect, it } from "vitest"
import { questions, questionCountsByChapter } from "."

describe("quizzes de Bioquímica", () => {
  it("cubre los seis temas de los cuestionarios escritos", () => {
    expect(Object.keys(questionCountsByChapter)).toHaveLength(6)
    for (const count of Object.values(questionCountsByChapter)) expect(count).toBeGreaterThanOrEqual(10)
  })

  it("usa distractores distintos y distribuye las respuestas correctas", () => {
    expect(new Set(questions.map(question => question.id)).size).toBe(questions.length)
    expect(new Set(questions.map(question => question.correctAnswers[0]))).toEqual(new Set([0, 1, 2, 3]))
    for (const question of questions) {
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options).size).toBe(4)
      expect(question.explanation.length).toBeGreaterThan(20)
    }
  })
})

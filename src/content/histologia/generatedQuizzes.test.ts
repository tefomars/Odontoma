import { describe, expect, it } from "vitest"

import { cap13Flashcards } from "@/content/flashcards/histologia/cap13"
import { cap14Flashcards } from "@/content/flashcards/histologia/cap14"
import { articuloHemostasiaFlashcards } from "@/content/flashcards/histologia/articuloHemostasia"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"

const banks = [
  {
    chapter: "Capítulo 13",
    cards: cap13Flashcards,
    questions: cap13Questions
  },
  {
    chapter: "Capítulo 14",
    cards: cap14Flashcards,
    questions: cap14Questions
  },
  {
    chapter: "Artículo · Hemostasia y trombosis",
    cards: articuloHemostasiaFlashcards,
    questions: hemostasiaQuestions
  }
]

describe("quizzes de Citohistología II y artículos", () => {
  it("crea bancos selectivos sin perder ningún apartado", () => {
    for (const bank of banks) {
      const sourceSubtopics = new Set(
        bank.cards.map(card => card.subtopic)
      )
      const quizSubtopics = new Set(
        bank.questions.map(question => question.topic)
      )

      expect(bank.questions.length).toBeLessThan(bank.cards.length)
      expect(bank.questions.length).toBeGreaterThan(40)
      expect(quizSubtopics).toEqual(sourceSubtopics)
    }
  })

  it("mantiene capítulos, respuestas y explicaciones apoyadas en las tarjetas fuente", () => {
    for (const bank of banks) {
      const sourcesById = new Map(
        bank.cards.map(card => [`quiz-${card.id}`, card])
      )

      bank.questions.forEach(question => {
        const source = sourcesById.get(question.id)

        expect(source).toBeDefined()
        expect(question.chapter).toBe(bank.chapter)
        expect(question.question).toBe(source?.front.trim())
        expect(question.options[question.correctAnswers[0]]).toBe(source?.back.trim())
        expect(question.explanation).toContain(source?.back.trim())
      })
    }
  })

  it("produce identificadores y opciones válidas sin duplicados", () => {
    const questions = banks.flatMap(bank => bank.questions)
    const ids = questions.map(question => question.id)

    expect(new Set(ids).size).toBe(ids.length)

    for (const question of questions) {
      expect(question.options.length).toBeGreaterThanOrEqual(2)
      expect(question.options.length).toBeLessThanOrEqual(4)
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(question.correctAnswers).toEqual([0])
      expect(["easy", "medium", "hard"]).toContain(question.difficulty)
    }
  })

  it("conserva representación de todas las dificultades en cada banco", () => {
    for (const bank of banks) {
      const difficulties = new Set(
        bank.questions.map(question => question.difficulty)
      )

      expect(difficulties).toEqual(new Set(["easy", "medium", "hard"]))
    }
  })

  it("compara factores de coagulación contra otros factores", () => {
    const question = hemostasiaQuestions.find(item =>
      item.question === "¿Qué factor de coagulación puede activar plasminógeno?"
    )

    expect(question).toBeDefined()
    expect(question?.options).toHaveLength(4)

    for (const option of question?.options || []) {
      expect(option.toLocaleLowerCase("es")).toMatch(/factor/)
    }
  })
})

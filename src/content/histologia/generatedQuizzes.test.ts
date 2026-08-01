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
  it("crea una pregunta por cada flashcard verificada", () => {
    for (const bank of banks) {
      expect(bank.questions).toHaveLength(bank.cards.length)
    }
  })

  it("mantiene capítulos, respuestas y explicaciones apoyadas en las tarjetas fuente", () => {
    for (const bank of banks) {
      bank.questions.forEach((question, index) => {
        const source = bank.cards[index]

        expect(question.chapter).toBe(bank.chapter)
        expect(question.question).toBe(source.front.trim())
        expect(question.options[question.correctAnswers[0]]).toBe(source.back.trim())
        expect(question.explanation).toContain(source.back.trim())
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
})

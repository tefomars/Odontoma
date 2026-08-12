import { describe, expect, it } from "vitest"

import { cap13Flashcards } from "@/content/flashcards/histologia/cap13"
import { cap14Flashcards } from "@/content/flashcards/histologia/cap14"
import { cap15Flashcards } from "@/content/flashcards/histologia/cap15"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"

const manualBanks = [
  {
    chapter: "Capítulo 13",
    cards: cap13Flashcards,
    questions: cap13Questions,
    expectedCount: 48
  },
  {
    chapter: "Capítulo 14",
    cards: cap14Flashcards,
    questions: cap14Questions,
    expectedCount: 48
  },
  {
    chapter: "Capítulo 15",
    cards: cap15Flashcards,
    questions: cap15Questions,
    expectedCount: 52
  }
]

describe("bancos manuales de Citohistología II", () => {
  it("mantiene tres bancos amplios y completamente independientes de las flashcards", () => {
    for (const bank of manualBanks) {
      expect(bank.questions).toHaveLength(bank.expectedCount)
      expect(new Set(bank.questions.map(question => question.topic)).size)
        .toBeGreaterThanOrEqual(12)

      const flashcardPrompts = new Set(
        bank.cards.map(card => card.front.trim().toLocaleLowerCase("es"))
      )

      const repeatedPrompts = bank.questions
        .filter(question =>
          flashcardPrompts.has(question.question.trim().toLocaleLowerCase("es"))
        )
        .map(question => question.id)

      expect(repeatedPrompts).toEqual([])
    }
  })

  it("usa identificadores, enunciados y opciones válidos sin duplicados", () => {
    const questions = manualBanks.flatMap(bank => bank.questions)

    expect(new Set(questions.map(question => question.id)).size)
      .toBe(questions.length)
    expect(new Set(questions.map(question => question.question)).size)
      .toBe(questions.length)

    for (const bank of manualBanks) {
      for (const question of bank.questions) {
        expect(question.chapter).toBe(bank.chapter)
        expect(question.type).toBe("single")
        expect(question.options).toHaveLength(4)
        expect(new Set(question.options).size).toBe(4)
        expect(question.correctAnswers).toEqual([0])
        expect(question.explanation.trim().length).toBeGreaterThan(20)
        expect(["easy", "medium", "hard"]).toContain(question.difficulty)
        expect(question.tags).toContain("Banco manual")
      }
    }
  })

  it("conserva representación de dificultad media y alta en cada capítulo", () => {
    for (const bank of manualBanks) {
      const difficulties = new Set(
        bank.questions.map(question => question.difficulty)
      )

      expect(difficulties.has("medium")).toBe(true)
      expect(difficulties.has("hard")).toBe(true)
    }
  })

  it("mantiene hechos sensibles del texto en sus respuestas correctas", () => {
    const adrenal = cap13Questions.find(question =>
      question.id === "quiz-cap13-033"
    )
    const thymus = cap14Questions.find(question =>
      question.id === "quiz-cap14-037"
    )
    const apocrine = cap15Questions.find(question =>
      question.id === "quiz-cap15-045"
    )

    expect(adrenal?.options[0]).toBe("Túnica media.")
    expect(thymus?.options[0]).toContain("Endotelio capilar continuo")
    expect(apocrine?.options[0]).toBe("Secreción merocrina por exocitosis.")
  })
})

describe("banco generado del artículo de hemostasia", () => {
  it("continúa produciendo preguntas estructuralmente válidas", () => {
    expect(hemostasiaQuestions.length).toBeGreaterThan(40)

    for (const question of hemostasiaQuestions) {
      expect(question.options.length).toBeGreaterThanOrEqual(2)
      expect(question.options.length).toBeLessThanOrEqual(4)
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(question.correctAnswers).toEqual([0])
    }
  })

  it("compara factores de coagulación con factores plausibles", () => {
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

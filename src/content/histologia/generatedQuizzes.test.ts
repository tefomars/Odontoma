import { describe, expect, it } from "vitest"

import { cap13Flashcards } from "@/content/flashcards/histologia/cap13"
import { cap14Flashcards } from "@/content/flashcards/histologia/cap14"
import { cap15Flashcards } from "@/content/flashcards/histologia/cap15"
import { cap16Flashcards } from "@/content/flashcards/histologia/cap16"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { cap16Questions } from "./cap16/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"
import { cap4Questions } from "./cap4/questions"
import { cap5Questions } from "./cap5/questions"
import { cap6Questions } from "./cap6/questions"
import { cap7Questions } from "./cap7/questions"
import { cap8Questions } from "./cap8/questions"
import { cap9Questions } from "./cap9/questions"
import { cap10Questions } from "./cap10/questions"
import { cap11Questions } from "./cap11/questions"
import { cap12Questions } from "./cap12/questions"

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
  },
  {
    chapter: "Capítulo 16",
    cards: cap16Flashcards,
    questions: cap16Questions,
    expectedCount: 56
  }
]

describe("bancos manuales de Citohistología II", () => {
  it("mantiene bancos amplios y completamente independientes de las flashcards", () => {
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

describe("bancos manuales reconstruidos", () => {
  const rebuiltBanks = [
    ["Capítulo 4", cap4Questions, 28],
    ["Capítulo 5", cap5Questions, 44],
    ["Capítulo 6", cap6Questions, 44],
    ["Capítulo 7", cap7Questions, 34],
    ["Capítulo 8", cap8Questions, 46],
    ["Capítulo 9", cap9Questions, 36],
    ["Capítulo 10", cap10Questions, 48],
    ["Capítulo 11", cap11Questions, 50],
    ["Capítulo 12", cap12Questions, 52],
    ["Artículo · Hemostasia y trombosis", hemostasiaQuestions, 40]
  ] as const

  it("mantiene la cobertura prevista y cuatro alternativas únicas", () => {
    const questions = rebuiltBanks.flatMap(([, bank]) => bank)
    expect(new Set(questions.map(question => question.id)).size).toBe(questions.length)
    expect(new Set(questions.map(question => question.question)).size).toBe(questions.length)

    for (const [chapter, bank, expectedCount] of rebuiltBanks) {
      expect(bank).toHaveLength(expectedCount)
      expect(new Set(bank.map(question => question.topic)).size).toBeGreaterThanOrEqual(4)

      for (const question of bank) {
        expect(question.chapter).toBe(chapter)
        expect(question.type).toBe("single")
        expect(question.options).toHaveLength(4)
        expect(new Set(question.options).size).toBe(4)
        expect(question.correctAnswers).toEqual([0])
        expect(question.explanation.trim().length).toBeGreaterThan(20)
        expect(question.tags).toContain("Banco manual")
      }
    }
  })

  it("conserva hechos sensibles de hemostasia según Robbins", () => {
    const adhesion = hemostasiaQuestions.find(question => question.id === "quiz-hem-10")
    const aggregation = hemostasiaQuestions.find(question => question.id === "quiz-hem-12")
    const warfarin = hemostasiaQuestions.find(question => question.id === "quiz-hem-24")

    expect(adhesion?.options[0]).toContain("GpIb")
    expect(aggregation?.options[0]).toContain("GpIIb/IIIa")
    expect(warfarin?.options[0]).toContain("factor VII")
  })
})

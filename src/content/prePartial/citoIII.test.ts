import { describe, expect, it } from "vitest"
import { cap19Questions } from "@/content/histologia/cap19/questions"
import { cap20Questions } from "@/content/histologia/cap20/questions"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { citoIIPrePartialQuestions } from "./citoII"
import { CITO_II_THIRD_PARTIAL, citoIIIPrePartialQuestions } from "./citoIII"
import { citoIIIPrePartialFlashcards } from "./citoIIIFlashcards"
import { getPrePartialBank } from "./banks"

describe("banco exclusivo de Parcial 3 · Cito II", () => {
  it("reconoce el nombre anterior sin cambiar los IDs del banco", () => {
    expect(getPrePartialBank("Parcial 3 · Cito III")?.id).toBe(CITO_II_THIRD_PARTIAL)
    expect(getPrePartialBank(CITO_II_THIRD_PARTIAL)?.questions).toBe(citoIIIPrePartialQuestions)
  })

  it("ofrece 60 opciones múltiples y 14 verdadero/falso sin reutilizar preguntas de otros bancos", () => {
    expect(citoIIIPrePartialQuestions).toHaveLength(74)
    expect(citoIIIPrePartialQuestions.filter(question => question.options.length === 4)).toHaveLength(60)
    expect(citoIIIPrePartialQuestions.filter(question => question.options.length === 2)).toHaveLength(14)

    const ids = citoIIIPrePartialQuestions.map(question => question.id)
    const otherIds = new Set([
      ...citoIIPrePartialQuestions,
      ...cap19Questions,
      ...cap20Questions
    ].map(question => question.id))

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => !otherIds.has(id))).toBe(true)

    for (const question of citoIIIPrePartialQuestions) {
      expect(question.chapter).toBe(CITO_II_THIRD_PARTIAL)
      expect(question.options.length).toBe(new Set(question.options).size)
      expect(question.correctAnswers).toHaveLength(1)
      expect(question.explanation.length).toBeGreaterThan(20)
    }
  })

  it("ofrece 80 flashcards esenciales, separadas de los mazos normales", () => {
    expect(citoIIIPrePartialFlashcards).toHaveLength(80)
    const ids = citoIIIPrePartialFlashcards.map(card => card.id)
    const normalIds = new Set(histologiaFlashcards.map(card => card.id))

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(id => !normalIds.has(id))).toBe(true)
    for (const card of citoIIIPrePartialFlashcards) {
      expect(card.chapter).toBe(CITO_II_THIRD_PARTIAL)
      expect(card.book).toBe("Repaso pre-parcial")
      expect(card.front.length).toBeGreaterThan(20)
      expect(card.back.trim().length).toBeGreaterThan(0)
      expect(card.back).not.toMatch(/^(verdadero|falso)\b/i)
    }
  })
})

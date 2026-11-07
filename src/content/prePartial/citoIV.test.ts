import { describe, expect, it } from "vitest"
import { CITO_II_FOURTH_PARTIAL, citoIVPrePartialQuestions } from "./citoIV"
import { citoIVPrePartialFlashcards } from "./citoIVFlashcards"
import { getPrePartialBank, prePartialBanks } from "./banks"
import { compactStudioData, resolveStudioBanks, studioBanks } from "../studio/catalog"
import { validateStudio } from "../studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"

const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "")

describe("repaso exclusivo de Parcial 4 · Cito II", () => {
  it("registra el banco para la app y la biblioteca del Builder", () => {
    const bank = getPrePartialBank(CITO_II_FOURTH_PARTIAL)!
    expect(bank).toBeDefined()
    expect(bank.kind).toBe("prepartial")
    expect(bank.subject).toBe("Histología")
    expect(bank.questions).toBe(citoIVPrePartialQuestions)
    expect(bank.flashcards).toEqual(citoIVPrePartialFlashcards)
    expect(prePartialBanks.filter(item => item.id === bank.id)).toHaveLength(1)
    expect(bank.chapters).toHaveLength(1)
    expect(bank.chapters[0].questionCount).toBe(96)
    expect(validateStudio({ version: 1, banks: [bank] })).toEqual([])
  })

  it("ofrece 78 opciones múltiples y 18 V/F con una sola clave", () => {
    expect(citoIVPrePartialQuestions).toHaveLength(96)
    expect(citoIVPrePartialQuestions.filter(item => item.options.length === 4)).toHaveLength(78)
    const trueFalse = citoIVPrePartialQuestions.filter(item => item.options.length === 2)
    expect(trueFalse).toHaveLength(18)
    expect(trueFalse.filter(item => item.correctAnswers[0] === 0)).toHaveLength(9)
    for (const item of citoIVPrePartialQuestions) {
      expect(item.chapter).toBe(CITO_II_FOURTH_PARTIAL)
      expect(item.correctAnswers).toHaveLength(1)
      expect(new Set(item.options.map(normalize)).size).toBe(item.options.length)
      expect(item.explanation.length).toBeGreaterThan(50)
      expect(item.options.join(" ")).not.toMatch(/todas (son|las anteriores)|ninguna (es|de las anteriores)/i)
    }
    for (const item of trueFalse) expect(item.options).toEqual(["Verdadero", "Falso"])
  })

  it("cubre los tres sistemas sin tomar preguntas de los bancos existentes", () => {
    const others = studioBanks.filter(bank => bank.id !== CITO_II_FOURTH_PARTIAL)
    const ids = new Set(others.flatMap(bank => bank.questions.map(question => question.id)))
    const stems = new Set(others.flatMap(bank => bank.questions.map(question => normalize(question.question))))
    expect(new Set(citoIVPrePartialQuestions.map(item => item.id)).size).toBe(96)
    expect(new Set(citoIVPrePartialQuestions.map(item => normalize(item.question))).size).toBe(96)
    for (const item of citoIVPrePartialQuestions) {
      expect(ids.has(item.id), item.id).toBe(false)
      expect(stems.has(normalize(item.question)), item.question).toBe(false)
    }
    for (const area of ["Endocrino", "Masculino", "Femenino"]) {
      expect(citoIVPrePartialQuestions.filter(item => item.topic.startsWith(area))).toHaveLength(32)
    }
  })

  it("mantiene las claves al mezclar alternativas de cuatro opciones y V/F", () => {
    const originalKeys = new Map(citoIVPrePartialQuestions.map(item => [item.id, item.options[item.correctAnswers[0]]]))
    const source = structuredClone(citoIVPrePartialQuestions)
    const shuffled = shuffleQuestionsBalanced(citoIVPrePartialQuestions)
    for (const item of shuffled) {
      expect(item.options[item.correctAnswers[0]]).toBe(originalKeys.get(item.id))
    }
    for (const optionCount of [2, 4]) {
      const set = shuffled.filter(item => item.options.length === optionCount)
      const counts = Array.from({ length: optionCount }, (_, position) => set.filter(item => item.correctAnswers[0] === position).length)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    }
    expect(citoIVPrePartialQuestions).toEqual(source)
  })

  it("ofrece 120 tarjetas directas con IDs y frentes independientes", () => {
    expect(citoIVPrePartialFlashcards).toHaveLength(120)
    const others = studioBanks.filter(bank => bank.id !== CITO_II_FOURTH_PARTIAL)
    const ids = new Set(others.flatMap(bank => bank.flashcards.map(card => card.id)))
    const fronts = new Set(others.flatMap(bank => bank.flashcards.map(card => normalize(card.front))))
    expect(new Set(citoIVPrePartialFlashcards.map(item => item.id)).size).toBe(120)
    expect(new Set(citoIVPrePartialFlashcards.map(item => normalize(item.front))).size).toBe(120)
    for (const card of citoIVPrePartialFlashcards) {
      expect(ids.has(card.id), card.id).toBe(false)
      expect(fronts.has(normalize(card.front)), card.front).toBe(false)
      expect(card.chapter).toBe(CITO_II_FOURTH_PARTIAL)
      expect(card.book).toBe("Repaso pre-parcial")
      expect(card.front).toMatch(/¿.+\?$/)
      expect(card.front).not.toMatch(/según|verdadero o falso|mencione cosas/i)
      expect(card.back).not.toMatch(/^(verdadero|falso)\b/i)
      expect(card.back.length).toBeGreaterThan(3)
      expect(card.back.length).toBeLessThan(240)
    }
    for (const area of ["Endocrino", "Masculino", "Femenino"]) {
      expect(citoIVPrePartialFlashcards.filter(item => item.topic.startsWith(area))).toHaveLength(40)
    }
  })

  it("conserva ediciones, eliminaciones y orden del Builder después de compactar y recargar", () => {
    const original = resolveStudioBanks({ version: 1, banks: [] })
    const banks = structuredClone(original)
    const bank = banks.find(item => item.id === CITO_II_FOURTH_PARTIAL)!
    bank.questions[0].question = "¿Pregunta editada por el dueño desde el Builder?"
    bank.questions.splice(1, 1)
    bank.questions.reverse()
    bank.flashcards[0].back = "Respuesta editada por el dueño."
    bank.flashcards.splice(1, 1)
    bank.flashcards.reverse()
    const saved = compactStudioData({ version: 1, banks })
    expect(saved.patches?.[bank.id]?.questions?.upserts).toHaveLength(1)
    expect(saved.patches?.[bank.id]?.flashcards?.upserts).toHaveLength(1)
    const restored = resolveStudioBanks(saved)
    expect(restored.find(item => item.id === bank.id)?.questions).toEqual(bank.questions)
    expect(restored.find(item => item.id === bank.id)?.flashcards).toEqual(bank.flashcards)
    expect(restored.filter(item => item.id !== bank.id)).toEqual(original.filter(item => item.id !== bank.id))
  })
})

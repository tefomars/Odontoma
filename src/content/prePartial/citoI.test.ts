import { describe, expect, it } from "vitest"
import { CITO_II_FIRST_PARTIAL, citoIPrePartialQuestions } from "./citoI"
import { citoIPrePartialFlashcards } from "./citoIFlashcards"
import { getCumulativePrePartialBank, getPrePartialBank, prePartialBanks } from "./banks"
import { compactStudioData, resolveStudioBanks, studioBanks } from "../studio/catalog"
import { validateStudio } from "../studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"

const normalized = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

describe("Parcial 1 · Cito II: cardiovascular, linfático y coagulación", () => {
  it("registra un banco exclusivo editable y lo incorpora al final sin duplicarlo en biblioteca", () => {
    const bank = getPrePartialBank(CITO_II_FIRST_PARTIAL)!
    expect(bank).toBeDefined()
    expect(bank.subject).toBe("Histología")
    expect(bank.kind).toBe("prepartial")
    expect(bank.questions).toBe(citoIPrePartialQuestions)
    expect(bank.flashcards).toEqual(citoIPrePartialFlashcards)
    expect(bank.chapters[0].questionCount).toBe(108)
    expect(prePartialBanks.filter(item => item.id === bank.id)).toHaveLength(1)
    expect(validateStudio({ version: 1, banks: [bank] })).toEqual([])
    expect(getCumulativePrePartialBank(bank.subject)!.chapters.map(item => item.id)).toContain(bank.id)
  })

  it("ofrece 90 MC y 18 V/F con una clave, opciones únicas y explicación", () => {
    expect(citoIPrePartialQuestions).toHaveLength(108)
    const mc = citoIPrePartialQuestions.filter(question => question.options.length === 4)
    const vf = citoIPrePartialQuestions.filter(question => question.options.length === 2)
    expect(mc).toHaveLength(90)
    expect(vf).toHaveLength(18)
    expect(vf.filter(question => question.correctAnswers[0] === 0)).toHaveLength(9)
    for (const question of citoIPrePartialQuestions) {
      expect(question.chapter).toBe(CITO_II_FIRST_PARTIAL)
      expect(question.type).toBe("single")
      expect(question.correctAnswers).toHaveLength(1)
      expect(question.explanation.length).toBeGreaterThan(50)
      expect(new Set(question.options.map(normalized)).size).toBe(question.options.length)
      expect(question.options.join(" ")).not.toMatch(/todas (son|las anteriores)|ninguna (es|de las anteriores)/i)
    }
    for (const question of vf) expect(question.options).toEqual(["Verdadero", "Falso"])
    // A length check is a warning net, not a semantic quality certificate.
    for (const question of mc) {
      const key = question.options[question.correctAnswers[0]].length
      const other = question.options.filter((_, i) => i !== question.correctAnswers[0]).map(option => option.length)
      expect(key, question.id).toBeLessThanOrEqual(Math.max(...other) * 1.5)
      expect(key, question.id).toBeGreaterThanOrEqual(Math.min(...other) * 0.6)
    }
  })

  it("cubre tres áreas con preguntas nuevas frente al resto de la app", () => {
    const others = studioBanks.filter(bank => bank.id !== CITO_II_FIRST_PARTIAL)
    const ids = new Set(others.flatMap(bank => bank.questions.map(question => question.id)))
    const stems = new Set(others.flatMap(bank => bank.questions.map(question => normalized(question.question))))
    expect(new Set(citoIPrePartialQuestions.map(question => question.id)).size).toBe(108)
    expect(new Set(citoIPrePartialQuestions.map(question => normalized(question.question))).size).toBe(108)
    for (const question of citoIPrePartialQuestions) {
      expect(ids.has(question.id), question.id).toBe(false)
      expect(stems.has(normalized(question.question)), question.question).toBe(false)
    }
    for (const area of ["Cardiovascular", "Linfático", "Hemostasia"]) {
      expect(citoIPrePartialQuestions.filter(question => question.topic.startsWith(area))).toHaveLength(36)
    }
  })

  it("ofrece 150 tarjetas breves de recuerdo directo, sin frentes copiados", () => {
    const others = studioBanks.filter(bank => bank.id !== CITO_II_FIRST_PARTIAL)
    const ids = new Set(others.flatMap(bank => bank.flashcards.map(card => card.id)))
    const fronts = new Set(others.flatMap(bank => bank.flashcards.map(card => normalized(card.front))))
    expect(citoIPrePartialFlashcards).toHaveLength(150)
    expect(new Set(citoIPrePartialFlashcards.map(card => card.id)).size).toBe(150)
    expect(new Set(citoIPrePartialFlashcards.map(card => normalized(card.front))).size).toBe(150)
    for (const card of citoIPrePartialFlashcards) {
      expect(ids.has(card.id), card.id).toBe(false)
      expect(fronts.has(normalized(card.front)), card.front).toBe(false)
      expect(card.chapter).toBe(CITO_II_FIRST_PARTIAL)
      expect(card.front).toMatch(/¿.+\?$/)
      expect(card.front).not.toMatch(/según (los apuntes|el texto|el libro)|verdadero o falso|mencione cosas|es correcto/i)
      expect(card.back).not.toMatch(/^(verdadero|falso)\b/i)
      expect(card.back.length).toBeGreaterThan(3)
      expect(card.back.length).toBeLessThan(240)
    }
    expect(citoIPrePartialFlashcards.filter(card => card.topic.startsWith("Cardiovascular"))).toHaveLength(50)
    expect(citoIPrePartialFlashcards.filter(card => card.topic.startsWith("Linfático"))).toHaveLength(60)
    expect(citoIPrePartialFlashcards.filter(card => card.topic.startsWith("Hemostasia"))).toHaveLength(40)
  })

  it("mantiene las claves al mezclar las letras de MC y V/F", () => {
    const before = structuredClone(citoIPrePartialQuestions)
    const keys = new Map(before.map(question => [question.id, question.options[question.correctAnswers[0]]]))
    const mixed = shuffleQuestionsBalanced(citoIPrePartialQuestions)
    for (const question of mixed) expect(question.options[question.correctAnswers[0]]).toBe(keys.get(question.id))
    for (const optionCount of [2, 4]) {
      const set = mixed.filter(question => question.options.length === optionCount)
      const counts = Array.from({ length: optionCount }, (_, position) => set.filter(question => question.correctAnswers[0] === position).length)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    }
    expect(citoIPrePartialQuestions).toEqual(before)
  })

  it("conserva ediciones, bajas y orden del Builder al guardar y recargar", () => {
    const original = resolveStudioBanks({ version: 1, banks: [] })
    const banks = structuredClone(original)
    const bank = banks.find(item => item.id === CITO_II_FIRST_PARTIAL)!
    bank.questions[0].explanation = "Explicación editada por el dueño."
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

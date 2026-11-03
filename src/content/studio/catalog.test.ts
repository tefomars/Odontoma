import { describe, expect, it } from "vitest"
import { studioBanks, resolveStudioBanks, compactStudioData } from "./catalog"
import { validateStudio } from "./schema"
import { questions } from "../histologia"
import { histologiaFlashcards } from "../flashcards/histologia/cards"

describe("biblioteca oficial editable", () => {
  it("conserva los IDs, respuestas y tarjetas de Histología sin migrar el progreso", () => {
    const bank = studioBanks.find(b => b.id === "histologia")!
    expect(bank.questions).toEqual(questions)
    expect(bank.flashcards.map(c => [c.front, c.back])).toEqual(histologiaFlashcards.map(c => [c.front, c.back]))
    expect(new Set(bank.flashcards.map(c => c.id)).size).toBe(bank.flashcards.length)
    expect(bank.flashcards.every(c => histologiaFlashcards.some(old => old.id === (c.legacyId || c.id)))).toBe(true)
  })
  it("permite guardar los bancos existentes y mantiene todos sus capítulos accesibles", () => {
    expect(validateStudio({ version: 1, banks: studioBanks })).toEqual([])
    for (const bank of studioBanks) {
      const ids = new Set(bank.chapters.map(c => c.id))
      expect([...bank.questions, ...bank.flashcards].every(q => ids.has(q.chapter))).toBe(true)
    }
  })
  it("rechaza importaciones sin respuesta correcta o con capítulos inexistentes", () => {
    const bank = structuredClone(studioBanks[0])
    bank.questions[0].correctAnswers = []
    bank.flashcards[0].chapter = "no-existe"
    expect(validateStudio({ version: 1, banks: [bank] })).toHaveLength(2)
  })
  it("resuelve imágenes heredadas y respeta que el editor quite una imagen", () => {
    const bank = structuredClone(studioBanks[0])
    const image = bank.chapters[0].image
    bank.chapters[0].image = "@legacy"
    expect(resolveStudioBanks({ version: 1, banks: [bank] })[0].chapters[0].image).toBe(image)
    bank.chapters[0].image = ""
    expect(resolveStudioBanks({ version: 1, banks: [bank] })[0].chapters[0].image).toBe("")
  })
  it("rechaza estructura incompleta e imágenes que puedan ejecutar código", () => {
    expect(validateStudio({ version: 1, banks: [null] }).length).toBeGreaterThan(0)
    const bank = structuredClone(studioBanks[0]); bank.questions[0].image = "javascript:alert(1)"
    expect(validateStudio({ version: 1, banks: [bank] }).length).toBeGreaterThan(0)
  })
  it("guarda solo la pregunta editada y conserva eliminaciones y orden al reconstruir", () => {
    const full = { version: 1 as const, banks: structuredClone(resolveStudioBanks({ version: 1, banks: [] })) }
    expect(JSON.stringify(compactStudioData(full)).length).toBeLessThan(100)
    full.banks[0].questions[0].question = "Pregunta editada desde el builder"
    full.banks[0].questions.splice(1, 1)
    full.banks[0].questions.reverse()
    const saved = compactStudioData(full)
    expect(saved.banks).toEqual([])
    expect(saved.patches?.histologia.questions?.upserts).toHaveLength(1)
    expect(saved.patches?.histologia.flashcards).toBeUndefined()
    const restored = resolveStudioBanks(saved)
    expect(restored[0].questions).toEqual(full.banks[0].questions)
    expect(restored[0].flashcards).toEqual(full.banks[0].flashcards)
    for (const chapter of restored[0].chapters) {
      expect(chapter.questionCount).toBe(full.banks[0].questions.filter(question => question.chapter === chapter.id).length)
    }
    expect(restored.slice(1)).toEqual(full.banks.slice(1))
  })
})

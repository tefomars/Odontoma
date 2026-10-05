import { describe, expect, it } from "vitest"
import { bioquimicaFlashcards } from "./cards"

describe("flashcards de Bioquímica", () => {
  it("cubre los doce temas de los tres parciales y conserva tarjetas válidas", () => {
    const topics = new Set(bioquimicaFlashcards.map(card => card.topic))
    expect(topics).toEqual(new Set([
      "Glucólisis",
      "Ciclo de Krebs",
      "Cadena respiratoria",
      "Metabolismo del glucógeno",
      "Gluconeogénesis",
      "Vía de las pentosas",
      "Beta oxidación",
      "Cetogénesis",
      "Síntesis de ácidos grasos",
      "Eicosanoides",
      "Lipoproteínas",
      "Colesterol"
    ]))
    expect(bioquimicaFlashcards.length).toBeGreaterThanOrEqual(100)
    expect(new Set(bioquimicaFlashcards.map(card => card.id)).size).toBe(bioquimicaFlashcards.length)
    for (const card of bioquimicaFlashcards) {
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
    }
  })

  it("integra los cuatro temas nuevos con bloques y cobertura del banco del tercer parcial", () => {
    const expectedCounts: Record<string, number> = {
      "Síntesis de ácidos grasos": 16,
      "Eicosanoides": 16,
      "Lipoproteínas": 16,
      "Colesterol": 17
    }

    for (const [topic, count] of Object.entries(expectedCounts)) {
      const cards = bioquimicaFlashcards.filter(card => card.topic === topic)
      expect(cards).toHaveLength(count)
      expect(new Set(cards.map(card => card.subtopic)).size).toBe(2)
      expect(cards.every(card => card.chapter === topic)).toBe(true)
    }
  })
})

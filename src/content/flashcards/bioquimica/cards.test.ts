import { describe, expect, it } from "vitest"
import { bioquimicaFlashcards } from "./cards"

describe("flashcards de Bioquímica", () => {
  it("cubre los seis temas y conserva tarjetas válidas", () => {
    const topics = new Set(bioquimicaFlashcards.map(card => card.topic))
    expect(topics).toEqual(new Set([
      "Glucólisis",
      "Ciclo de Krebs",
      "Cadena respiratoria",
      "Metabolismo del glucógeno",
      "Gluconeogénesis",
      "Vía de las pentosas"
    ]))
    expect(bioquimicaFlashcards.length).toBeGreaterThanOrEqual(80)
    expect(new Set(bioquimicaFlashcards.map(card => card.id)).size).toBe(bioquimicaFlashcards.length)
    for (const card of bioquimicaFlashcards) {
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
    }
  })
})

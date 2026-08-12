import { describe, expect, it } from "vitest"
import { histologiaFlashcards } from "./cards"

const reviewedChapters = new Set(
  Array.from({ length: 9 }, (_, index) => `Capítulo ${index + 4}`)
)

describe("flashcards de Histología, capítulos 4–12", () => {
  const cards = histologiaFlashcards.filter((card) =>
    reviewedChapters.has(card.chapter)
  )

  it("mantiene identificadores y contenido completos", () => {
    expect(cards.length).toBeGreaterThan(0)
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length)

    for (const card of cards) {
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
    }
  })

  it("no repite literalmente una pregunta dentro del mismo capítulo", () => {
    const keys = cards.map(
      (card) => `${card.chapter}\u0000${card.front.trim().toLocaleLowerCase("es")}`
    )

    expect(new Set(keys).size).toBe(keys.length)
  })
})

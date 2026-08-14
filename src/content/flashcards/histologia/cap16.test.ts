import { describe, expect, it } from "vitest"
import { cap16Flashcards } from "./cap16"

describe("flashcards del capítulo 16", () => {
  it("mantiene el banco completo, único y organizado", () => {
    expect(cap16Flashcards).toHaveLength(510)
    expect(new Set(cap16Flashcards.map(card => card.id)).size).toBe(510)
    expect(new Set(cap16Flashcards.map(card => card.front)).size).toBe(510)
    expect(new Set(cap16Flashcards.map(card => card.subtopic)).size).toBeGreaterThanOrEqual(18)

    for (const card of cap16Flashcards) {
      expect(card.chapter).toBe("Capítulo 16")
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
    }
  })
})

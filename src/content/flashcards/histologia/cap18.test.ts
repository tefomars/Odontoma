import { describe, expect, it } from "vitest"
import { cap18Flashcards } from "./cap18"

describe("flashcards del capítulo 18", () => {
  it("mantiene una cobertura amplia, organizada y sin duplicados", () => {
    expect(cap18Flashcards.length).toBeGreaterThanOrEqual(340)
    expect(new Set(cap18Flashcards.map(card => card.id)).size).toBe(cap18Flashcards.length)
    expect(new Set(cap18Flashcards.map(card => card.front)).size).toBe(cap18Flashcards.length)
    expect(new Set(cap18Flashcards.map(card => card.subtopic)).size).toBeGreaterThanOrEqual(25)

    for (const card of cap18Flashcards) {
      expect(card.chapter).toBe("Capítulo 18")
      expect(card.front.trim().length).toBeGreaterThan(20)
      expect(card.back.trim().length).toBeGreaterThan(2)
    }
  })
})

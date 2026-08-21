import { describe, expect, it } from "vitest"
import { cap17Flashcards } from "./cap17"

describe("flashcards del capítulo 17", () => {
  it("mantiene un banco amplio, único y organizado", () => {
    expect(cap17Flashcards.length).toBeGreaterThanOrEqual(400)
    expect(new Set(cap17Flashcards.map(card => card.id)).size).toBe(cap17Flashcards.length)
    expect(new Set(cap17Flashcards.map(card => card.front)).size).toBe(cap17Flashcards.length)
    expect(new Set(cap17Flashcards.map(card => card.subtopic)).size).toBeGreaterThanOrEqual(20)

    for (const card of cap17Flashcards) {
      expect(card.chapter).toBe("Capítulo 17")
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
    }
  })
})

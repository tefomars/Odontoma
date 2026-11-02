import { describe, expect, it } from "vitest"
import { advanceFreeReview, createFreeReview, selectFlashcardPreference, selectFlashcardScope, undoFreeReview } from "./flashcardPractice"
import type { Flashcard } from "@/content/flashcards/histologia/cards"
import type { FsrsStorage } from "./fsrs"
import { createEmptyCard } from "ts-fsrs"
const cards = [
  { id: "a", chapter: "chapter-uuid", topic: "Tema", subtopic: "Uno", front: "A", back: "R" },
  { id: "b", chapter: "chapter-uuid", topic: "Tema", subtopic: "Dos", front: "B", back: "R" },
  { id: "c", chapter: "Otra materia", topic: "Otro", subtopic: "Tres", front: "C", back: "R" }
] as Flashcard[]
const a = { card: createEmptyCard(new Date("2099-01-01")), dueDate: "2099-01-01T00:00:00Z", reviewCount: 1, lapseCount: 0 }
const b = { card: createEmptyCard(new Date("2000-01-01")), dueDate: "2000-01-01T00:00:00Z", reviewCount: 1, lapseCount: 0 }
const storage: FsrsStorage = { cards: { a, b }, reviews: [{ cardId: "a", rating: "again", reviewedAt: "2000-01-01T00:00:00Z", stateAfter: a }] }
describe("repaso libre de flashcards", () => {
  it("incluye nuevas y tarjetas en cooldown sin cambiar FSRS", () => {
    const before = structuredClone(storage)
    expect(selectFlashcardPreference(cards, storage, "mixed").map(c => c.id)).toEqual(["a", "b", "c"])
    let round = createFreeReview(["a", "b", "c"])
    round = advanceFreeReview(round, false)
    round = advanceFreeReview(round, true)
    round = undoFreeReview(round)
    expect(round.queue[round.cursor]).toBe("b")
    expect(storage).toEqual(before)
  })
  it("mantiene el alcance de capítulo, subtemas agrupados y decks propios", () => {
    expect(selectFlashcardScope(cards, "default", "chapter-uuid").map(c => c.id)).toEqual(["a", "b"])
    expect(selectFlashcardScope(cards, "default", "chapter-uuid", "__subtopics:Dos").map(c => c.id)).toEqual(["b"])
    expect(selectFlashcardScope(cards, "default", "Tema", "Uno").map(c => c.id)).toEqual(["a"])
    expect(selectFlashcardScope(cards.slice(0, 1), "user", "topic-user")).toHaveLength(1)
  })
  it("respeta nuevas/incorrectas y solo ignora las fechas cuando se solicita", () => {
    expect(selectFlashcardPreference(cards, storage, "new").map(c => c.id)).toEqual(["c"])
    expect(selectFlashcardPreference(cards, storage, "incorrect").map(c => c.id)).toEqual(["a"])
    expect(selectFlashcardPreference(cards, storage, "mixed", "__reviewed_due").map(c => c.id)).toEqual(["b"])
    expect(selectFlashcardPreference(cards, storage, "mixed", "__reviewed_due", Date.now(), true).map(c => c.id)).toEqual(["a", "b"])
  })
  it("Otra vez reencola al final, permite terminar y no modifica la ronda previa", () => {
    const initial = createFreeReview(["a", "b"])
    let round = advanceFreeReview(initial, true)
    expect(round.queue).toEqual(["a", "b", "a"])
    expect(round.queue[round.cursor]).toBe("b")
    round = advanceFreeReview(round, false); round = advanceFreeReview(round, false)
    expect(round.cursor).toBe(round.queue.length)
    expect(initial).toEqual({ queue: ["a", "b"], cursor: 0, past: [] })
    expect(undoFreeReview(round).queue[undoFreeReview(round).cursor]).toBe("a")
  })
  it("cinco undos recuperan exactamente las cinco cartas anteriores", () => {
    let round = createFreeReview(["1", "2", "3", "4", "5", "6"])
    for (let i = 0; i < 5; i++) round = advanceFreeReview(round, false)
    for (const id of ["5", "4", "3", "2", "1"]) { round = undoFreeReview(round); expect(round.queue[round.cursor]).toBe(id) }
    expect(undoFreeReview(round)).toBe(round)
  })
})

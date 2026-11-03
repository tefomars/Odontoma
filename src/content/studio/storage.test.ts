import { describe, expect, it } from "vitest"
import { applyBankPatch } from "./storage"
import type { StudyBank } from "./schema"

describe("custom order and future official content", () => {
  it("retains new official questions/cards while respecting order and explicit removals", () => {
    const bank = { id: "bank", questions: [{ id: "a" }, { id: "b" }, { id: "future" }], flashcards: [{ id: "a" }, { id: "b" }, { id: "future" }] } as StudyBank
    const patch = { upserts: [], removed: ["b"], order: ["b", "a"] }
    const result = applyBankPatch(bank, { questions: patch, flashcards: patch })
    expect(result.questions.map(q => q.id)).toEqual(["a", "future"])
    expect(result.flashcards.map(q => q.id)).toEqual(["a", "future"])
    expect(bank.questions.map(q => q.id)).toEqual(["a", "b", "future"])
  })
})

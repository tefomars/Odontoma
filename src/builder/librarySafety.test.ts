import { describe, expect, it } from "vitest"
import { contentRevision, draftNeedsReview, itemChanges, readLibraryDraft, writtenChanges } from "./librarySafety"

describe("library draft recovery safety", () => {
  const current = { version: 1 as const, banks: [] }
  it("reads legacy drafts without pretending they have a known baseline", () => {
    expect(readLibraryDraft(current)).toEqual({ data: current })
    expect(readLibraryDraft(null)).toBeUndefined()
    expect(readLibraryDraft({ banks: [] })).toBeUndefined()
  })
  it("requires review only for a differing draft from an unknown/old baseline", async () => {
    const revision = await contentRevision(current)
    const changed = { ...current, banks: [{ id: "old" }] } as unknown as typeof current
    expect(draftNeedsReview({ data: changed }, current, revision)).toBe(true)
    expect(draftNeedsReview({ data: changed, baseRevision: revision }, current, revision)).toBe(false)
    expect(draftNeedsReview({ data: current }, current, revision)).toBe(false)
    expect(await contentRevision(changed)).not.toBe(revision)
  })
  it("counts additions, edits and removals, not mere reorderings", () => {
    expect(itemChanges([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "a" }])).toEqual({ added: 0, modified: 0, removed: 0 })
    expect(itemChanges([{ id: "a" }, { id: "b" }], [{ id: "a", changed: true }, { id: "c" }] as { id: string }[])).toEqual({ added: 1, modified: 1, removed: 1 })
  })
  it("counts written questions independently of multiple choice", () => {
    const before = { decks: [{ id: "exam", questions: [{ id: "a", prompt: "old" }, { id: "b" }] }] }
    const after = { decks: [{ id: "exam", questions: [{ id: "a", prompt: "new" }, { id: "c" }] }] }
    expect(writtenChanges(before, after)).toEqual({ added: 1, modified: 1, removed: 1 })
  })
})

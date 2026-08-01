import { describe, expect, it } from "vitest"

import type {
  FsrsCardState,
  FsrsStorage
} from "@/lib/fsrs"

import {
  undoFsrsReview
} from "@/lib/flashcardStorage"

const emptyState = {} as FsrsCardState

describe("undoFsrsReview", () => {
  it("deshace únicamente el review señalado aunque no sea el último global", () => {
    const storage: FsrsStorage = {
      cards: {
        a: { ...emptyState, dueDate: "after-a" },
        b: { ...emptyState, dueDate: "after-b" }
      },
      reviews: [
        {
          cardId: "a",
          reviewedAt: "2026-07-31T10:00:00.000Z",
          rating: "good",
          stateBefore: { ...emptyState, dueDate: "before-a" },
          stateAfter: { ...emptyState, dueDate: "after-a" }
        },
        {
          cardId: "b",
          reviewedAt: "2026-07-31T10:01:00.000Z",
          rating: "good",
          stateAfter: { ...emptyState, dueDate: "after-b" }
        }
      ]
    }

    const result = undoFsrsReview(storage, {
      cardId: "a",
      reviewedAt: "2026-07-31T10:00:00.000Z"
    })

    expect(result?.cards.a.dueDate).toBe("before-a")
    expect(result?.cards.b.dueDate).toBe("after-b")
    expect(result?.reviews.map(review => review.cardId)).toEqual(["b"])
  })
})

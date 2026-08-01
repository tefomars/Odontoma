import { describe, expect, it } from "vitest"

import type {
  FsrsReviewLog
} from "@/lib/fsrs"

import {
  getFsrsOptimizationEligibility
} from "@/lib/fsrsEligibility"

function review(cardId: string, reviewedAt: string) {
  return { cardId, reviewedAt } as FsrsReviewLog
}

describe("FSRS optimizer eligibility", () => {
  it("no habilita el entrenamiento con 100 repasos del mismo día", () => {
    const reviews = Array.from({ length: 100 }, (_, index) =>
      review(`card-${index}`, "2026-07-31T10:00:00.000Z")
    )

    expect(getFsrsOptimizationEligibility(reviews)).toMatchObject({
      enoughReviews: true,
      hasDifferentDays: false,
      ready: false
    })
  })

  it("habilita el entrenamiento cuando una tarjeta se repasó en días distintos", () => {
    const reviews = Array.from({ length: 98 }, (_, index) =>
      review(`card-${index}`, "2026-07-31T10:00:00.000Z")
    )

    reviews.push(
      review("repeated", "2026-07-30T10:00:00.000Z"),
      review("repeated", "2026-07-31T10:00:00.000Z")
    )

    expect(getFsrsOptimizationEligibility(reviews).ready).toBe(true)
  })
})

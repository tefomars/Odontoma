import {
  initOptimizer
} from "@open-spaced-repetition/binding/dynamic-wasi"

import wasmUrl from "@open-spaced-repetition/binding-wasm32-wasi/fsrs-binding.wasm32-wasi.wasm?url"
import WasiWorker from "@open-spaced-repetition/binding-wasm32-wasi/wasi-worker-browser.mjs?worker"

import type {
  FsrsReviewLog,
  FsrsStorage
} from "@/lib/fsrs"

import type {
  OdontomaFsrsParameters
} from "@/lib/fsrsParameters"

import {
  getDesiredRetention
} from "@/lib/fsrsParameters"

const DAY_MS =
  24 * 60 * 60 * 1000

type OptimizerBinding =
  Awaited<ReturnType<typeof initOptimizer>>

let optimizerPromise:
  Promise<OptimizerBinding> | null = null

function getOptimizer() {
  if (!globalThis.crossOriginIsolated) {
    throw new Error(
      "El optimizador necesita aislamiento seguro del navegador. Recargá Odontoma desde su servidor actualizado."
    )
  }

  if (!optimizerPromise) {
    optimizerPromise =
      initOptimizer({
        wasm: wasmUrl,
        worker: () => new WasiWorker()
      })
  }

  return optimizerPromise
}

function toRating(
  rating: FsrsReviewLog["rating"]
) {
  if (rating === "again") return 1
  if (rating === "hard") return 2
  if (rating === "good") return 3

  return 4
}

function localDayNumber(value: string) {
  const date =
    new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return Math.floor(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ) / DAY_MS
  )
}

function buildTrainingItems(
  binding: OptimizerBinding,
  reviews: FsrsReviewLog[]
) {
  const byCard =
    new Map<string, FsrsReviewLog[]>()

  for (const review of reviews) {
    const list =
      byCard.get(review.cardId) || []

    list.push(review)
    byCard.set(review.cardId, list)
  }

  const items:
    InstanceType<OptimizerBinding["FSRSBindingItem"]>[] = []

  for (const cardReviews of byCard.values()) {
    const sorted =
      [...cardReviews]
        .filter(review =>
          localDayNumber(review.reviewedAt) !== null
        )
        .sort((a, b) =>
          new Date(a.reviewedAt).getTime() -
          new Date(b.reviewedAt).getTime()
        )

    if (sorted.length < 2) continue

    const deltas =
      sorted.map((review, index) => {
        if (index === 0) return 0

        const current =
          localDayNumber(review.reviewedAt) || 0

        const previous =
          localDayNumber(sorted[index - 1].reviewedAt) || 0

        return Math.max(0, current - previous)
      })

    for (
      let currentIndex = 1;
      currentIndex < sorted.length;
      currentIndex++
    ) {
      if (deltas[currentIndex] <= 0) continue

      const history =
        sorted
          .slice(0, currentIndex + 1)
          .map((review, index) =>
            new binding.FSRSBindingReview(
              toRating(review.rating),
              deltas[index]
            )
          )

      items.push(
        new binding.FSRSBindingItem(history)
      )
    }
  }

  return items
}

function buildStats(
  storage: FsrsStorage,
  trainingItems: number
) {
  const reviews =
    storage.reviews || []

  const rememberedCount =
    reviews.filter(review =>
      review.rating !== "again"
    ).length

  const forgottenCount =
    reviews.length - rememberedCount

  const scheduledDays =
    reviews
      .map(review =>
        Number(
          review.stateAfter?.card?.scheduled_days || 0
        )
      )
      .filter(value => value > 0)

  return {
    reviewCount: reviews.length,
    rememberedCount,
    forgottenCount,
    retention:
      reviews.length > 0
        ? rememberedCount / reviews.length
        : 0,
    targetRetention:
      getDesiredRetention(),
    averageScheduledDays:
      scheduledDays.length > 0
        ? scheduledDays.reduce((sum, value) => sum + value, 0) /
          scheduledDays.length
        : 0,
    trainingItems
  }
}

export async function optimizeFsrsParameters(
  storage: FsrsStorage
): Promise<OdontomaFsrsParameters> {
  const binding =
    await getOptimizer()

  const trainingItems =
    buildTrainingItems(
      binding,
      storage.reviews || []
    )

  if (trainingItems.length === 0) {
    throw new Error(
      "Todavía no hay repasos realizados en días distintos para entrenar FSRS."
    )
  }

  const weights =
    await binding.computeParameters(
      trainingItems,
      {
        enableShortTerm: true,
        numRelearningSteps: 1
      }
    )

  const evaluation =
    new binding.FSRSBinding(weights)
      .evaluate(trainingItems)

  const stats =
    buildStats(
      storage,
      trainingItems.length
    )

  return {
    weights,
    requestRetention:
      getDesiredRetention(),
    optimizedAt:
      new Date().toISOString(),
    reviewCount:
      storage.reviews.length,
    optimizer: "fsrs-rs",
    stats: {
      ...stats,
      logLoss: evaluation.logLoss,
      rmseBins: evaluation.rmseBins
    }
  }
}

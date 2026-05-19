import {
  generatorParameters
} from "ts-fsrs"

import type {
  FsrsReviewLog,
  FsrsStorage
} from "@/lib/fsrs"

import type {
  OdontomaFsrsParameters
} from "@/lib/fsrsParameters"

type OptimizationStats = {
  reviewCount: number
  rememberedCount: number
  forgottenCount: number
  retention: number
  targetRetention: number
  intervalScale: number
  averageScheduledDays: number
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  )
}

function isRememberedReview(
  review: FsrsReviewLog
) {
  return (
    review.rating === "hard" ||
    review.rating === "good" ||
    review.rating === "easy"
  )
}

function getScheduledDays(
  review: FsrsReviewLog
) {
  const direct =
    Number(review.fsrsLog?.scheduled_days)

  if (Number.isFinite(direct) && direct > 0) {
    return direct
  }

  const stateDays =
    Number(review.stateAfter?.card?.scheduled_days)

  if (Number.isFinite(stateDays) && stateDays > 0) {
    return stateDays
  }

  return 0
}

function buildStats(
  reviews: FsrsReviewLog[]
): OptimizationStats {

  const reviewCount =
    reviews.length

  const rememberedCount =
    reviews.filter(isRememberedReview).length

  const forgottenCount =
    reviewCount - rememberedCount

  const retention =
    reviewCount > 0
      ? rememberedCount / reviewCount
      : 0

  const scheduledDays =
    reviews
      .map(getScheduledDays)
      .filter(value => value > 0)

  const averageScheduledDays =
    scheduledDays.length > 0
      ? scheduledDays.reduce((sum, value) => sum + value, 0) / scheduledDays.length
      : 0

  return {
    reviewCount,
    rememberedCount,
    forgottenCount,
    retention,
    targetRetention: 0.9,
    intervalScale: 1,
    averageScheduledDays
  }
}

function scaleWeights(
  weights: number[],
  scale: number
) {

  const next =
    [...weights]

  /*
    w0-w3: initial stability.
    Lower = shorter first intervals.
    Higher = longer first intervals.
  */
  for (const index of [0, 1, 2, 3]) {
    next[index] =
      Number(
        clamp(
          next[index] * scale,
          0.05,
          100
        ).toFixed(8)
      )
  }

  /*
    w8, w10, w15, w16, w17, w18, w19 affect stability growth / short-term behavior.
    We keep this conservative so it does not make the scheduler weird.
  */
  for (const index of [8, 10, 15, 16, 17, 18, 19]) {
    if (typeof next[index] === "number") {
      const softScale =
        1 + ((scale - 1) * 0.35)

      next[index] =
        Number(
          clamp(
            next[index] * softScale,
            0.001,
            10
          ).toFixed(8)
        )
    }
  }

  return next
}

export function optimizeFsrsParameters(
  storage: FsrsStorage
): OdontomaFsrsParameters & {
  stats: OptimizationStats
} {

  const reviews =
    storage.reviews || []

  const stats =
    buildStats(reviews)

  const base =
    generatorParameters()

  const baseWeights =
    Array.from(base.w)

  const retentionGap =
    stats.retention - stats.targetRetention

  /*
    If retention is lower than target, shorten intervals.
    If retention is higher than target, allow slightly longer intervals.
  */
  const intervalScale =
    clamp(
      1 + retentionGap * 1.25,
      0.72,
      1.18
    )

  const requestRetention =
    clamp(
      0.9 - retentionGap * 0.18,
      0.82,
      0.96
    )

  const weights =
    scaleWeights(
      baseWeights,
      intervalScale
    )

  return {
    weights,
    requestRetention: Number(requestRetention.toFixed(4)),
    optimizedAt: new Date().toISOString(),
    reviewCount: stats.reviewCount,
    stats: {
      ...stats,
      intervalScale: Number(intervalScale.toFixed(4))
    }
  }
}

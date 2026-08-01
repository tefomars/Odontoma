import type {
  FsrsReviewLog
} from "@/lib/fsrs"

export const MIN_REVIEWS_FOR_OPTIMIZATION = 100

function localDayKey(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function hasFsrsReviewsOnDifferentDays(
  reviews: FsrsReviewLog[]
) {
  const daysByCard = new Map<string, Set<string>>()

  for (const review of reviews) {
    const day = localDayKey(review.reviewedAt)
    if (!day) continue

    const days = daysByCard.get(review.cardId) || new Set<string>()
    days.add(day)

    if (days.size >= 2) return true
    daysByCard.set(review.cardId, days)
  }

  return false
}

export function getFsrsOptimizationEligibility(
  reviews: FsrsReviewLog[]
) {
  const reviewCount = reviews.length
  const enoughReviews = reviewCount >= MIN_REVIEWS_FOR_OPTIMIZATION
  const hasDifferentDays = hasFsrsReviewsOnDifferentDays(reviews)

  return {
    reviewCount,
    missingReviews: Math.max(0, MIN_REVIEWS_FOR_OPTIMIZATION - reviewCount),
    enoughReviews,
    hasDifferentDays,
    ready: enoughReviews && hasDifferentDays
  }
}

import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type CardInput,
  type ReviewLog
} from "ts-fsrs"

import {
  getDesiredRetention,
  loadFsrsParameters
} from "@/lib/fsrsParameters"

import {
  balanceFsrsDueDate
} from "@/lib/fsrsLoadBalancer"

export type FsrsRating =
  | "again"
  | "hard"
  | "good"
  | "easy"

export type FsrsCardState = {
  card: CardInput & {
    dueDate?: string
    reviewCount?: number
    lapseCount?: number
  }
  dueDate: string
  lastReviewed?: string
  reviewCount: number
  lapseCount: number
}

export type FsrsReviewLog = {
  cardId: string
  rating: FsrsRating
  reviewedAt: string
  stateBefore?: FsrsCardState
  stateAfter: FsrsCardState
  fsrsLog?: ReviewLog
}

export type FsrsProgressMap = {
  [cardId: string]: FsrsCardState
}

export type FsrsStorage = {
  cards: FsrsProgressMap
  reviews: FsrsReviewLog[]
}

const LEARNING_STEPS =
  ["10m"] as const

const RELEARNING_STEPS =
  ["10m"] as const

function createScheduler() {
  const savedParameters =
    loadFsrsParameters()

  const base = {
    request_retention:
      getDesiredRetention(),
    enable_fuzz: false,
    enable_short_term: true,
    learning_steps: LEARNING_STEPS,
    relearning_steps: RELEARNING_STEPS
  }

  if (
    savedParameters?.weights &&
    savedParameters.weights.length > 0
  ) {
    return fsrs(
      generatorParameters({
        ...base,
        w: savedParameters.weights
      })
    )
  }

  return fsrs(
    generatorParameters(base)
  )
}

function toTsFsrsRating(
  rating: FsrsRating
) {
  if (rating === "again") return Rating.Again
  if (rating === "hard") return Rating.Hard
  if (rating === "good") return Rating.Good

  return Rating.Easy
}

function getCardDueDate(
  card: FsrsCardState["card"]
) {
  return new Date(
    card.due ?? card.dueDate ?? Date.now()
  ).toISOString()
}

function getReviewCount(
  card: FsrsCardState["card"]
) {
  return Number(
    card.reps ?? card.reviewCount ?? 0
  )
}

function getLapseCount(
  card: FsrsCardState["card"]
) {
  return Number(
    card.lapses ?? card.lapseCount ?? 0
  )
}

function createStateFromCard(
  card: FsrsCardState["card"],
  reviewedAt?: Date
): FsrsCardState {
  return {
    card,
    dueDate: getCardDueDate(card),
    lastReviewed: reviewedAt?.toISOString(),
    reviewCount: getReviewCount(card),
    lapseCount: getLapseCount(card)
  }
}

function maybeBalanceState(params: {
  cardId?: string
  state: FsrsCardState
  progress?: FsrsProgressMap
  reviewedAt: Date
}) {
  if (!params.cardId || !params.progress) {
    return params.state
  }

  return balanceFsrsDueDate({
    cardId: params.cardId,
    state: params.state,
    progress: params.progress,
    reviewedAt: params.reviewedAt
  })
}

export function reviewFsrsCard(params: {
  cardId: string
  currentState?: FsrsCardState
  progress?: FsrsProgressMap
  rating: FsrsRating
  reviewedAt?: Date
}) {
  const now =
    params.reviewedAt || new Date()

  const card =
    params.currentState?.card ||
    createEmptyCard(now)

  const result =
    createScheduler().next(
      card,
      now,
      toTsFsrsRating(params.rating)
    )

  const fsrsState =
    createStateFromCard(
      result.card,
      now
    )

  const stateAfter =
    maybeBalanceState({
      cardId: params.cardId,
      state: fsrsState,
      progress: params.progress,
      reviewedAt: now
    })

  const log: FsrsReviewLog = {
    cardId: params.cardId,
    rating: params.rating,
    reviewedAt: now.toISOString(),
    stateBefore: params.currentState,
    stateAfter,
    fsrsLog: result.log
  }

  return {
    stateAfter,
    log
  }
}

export function previewFsrsCard(params: {
  cardId?: string
  currentState?: FsrsCardState
  progress?: FsrsProgressMap
  reviewedAt?: Date
}) {
  const now =
    params.reviewedAt || new Date()

  const card =
    params.currentState?.card ||
    createEmptyCard(now)

  const preview =
    createScheduler().repeat(
      card,
      now
    )

  function stateFor(
    rating: Rating
  ) {
    return maybeBalanceState({
      cardId: params.cardId,
      state: createStateFromCard(
        preview[rating].card,
        now
      ),
      progress: params.progress,
      reviewedAt: now
    })
  }

  return {
    again: stateFor(Rating.Again),
    hard: stateFor(Rating.Hard),
    good: stateFor(Rating.Good),
    easy: stateFor(Rating.Easy)
  }
}

export function isFsrsCardDue(
  cardId: string,
  cards: FsrsProgressMap
) {
  const state =
    cards[cardId]

  if (!state) return true

  return (
    new Date(state.dueDate).getTime() <=
    Date.now()
  )
}

export function getDueFsrsCards<T extends { id: string }>(
  cards: T[],
  progress: FsrsProgressMap,
  newCardOrderSeed = "odontoma"
) {
  const reviewedDueCards = cards
    .filter(card =>
      progress[card.id] &&
      isFsrsCardDue(card.id, progress)
    )
    .sort((first, second) =>
      new Date(progress[first.id].dueDate).getTime() -
      new Date(progress[second.id].dueDate).getTime()
    )

  const newCards = cards
    .filter(card => !progress[card.id])
    .sort((first, second) =>
      seededCardOrder(first.id, newCardOrderSeed) -
      seededCardOrder(second.id, newCardOrderSeed)
    )

  return [
    ...reviewedDueCards,
    ...newCards
  ]
}

function seededCardOrder(
  cardId: string,
  seed: string
) {
  const value = `${seed}:${cardId}`
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

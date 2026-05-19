import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating
} from "ts-fsrs"

import {
  loadFsrsParameters
} from "@/lib/fsrsParameters"

export type FsrsRating =
  | "again"
  | "hard"
  | "good"
  | "easy"

export type FsrsCardState = {
  card: any
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
  fsrsLog?: any
}

export type FsrsProgressMap = {
  [cardId: string]: FsrsCardState
}

export type FsrsStorage = {
  cards: FsrsProgressMap
  reviews: FsrsReviewLog[]
}

const DAY_MS =
  24 * 60 * 60 * 1000

const DEFAULT_FSRS_FIRST_INTERVAL_MS: Record<FsrsRating, number> = {
  again: 1 * 60 * 1000,
  hard: 6 * 60 * 1000,
  good: 10 * 60 * 1000,
  easy: 11 * DAY_MS
}

const FRIENDLY_FIRST_INTERVAL_MS: Record<FsrsRating, number> = {
  again: 1 * DAY_MS,
  hard: 1.35 * DAY_MS,
  good: 2 * DAY_MS,
  easy: 11 * DAY_MS
}

function clampNumber(
  value: number,
  min: number,
  max: number
) {

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  )
}

function getRetentionScale() {

  const savedParameters =
    loadFsrsParameters()

  const retention =
    savedParameters?.requestRetention ?? 0.9

  return clampNumber(
    0.9 / retention,
    0.65,
    1.6
  )
}

function getIntervalMs(
  reviewedAt: Date,
  dueDate: string
) {

  return Math.max(
    60 * 1000,
    new Date(dueDate).getTime() - reviewedAt.getTime()
  )
}

function applyFriendlyFirstReviewInterval(
  state: FsrsCardState,
  rating: FsrsRating,
  reviewedAt: Date
): FsrsCardState {

  const fsrsInterval =
    getIntervalMs(
      reviewedAt,
      state.dueDate
    )

  const defaultFsrsInterval =
    DEFAULT_FSRS_FIRST_INTERVAL_MS[rating]

  const fsrsScale =
    clampNumber(
      fsrsInterval / defaultFsrsInterval,
      0.35,
      3.5
    )

  const retentionScale =
    getRetentionScale()

  const finalInterval =
    Math.round(
      FRIENDLY_FIRST_INTERVAL_MS[rating] *
      fsrsScale *
      retentionScale
    )

  const due =
    new Date(
      reviewedAt.getTime() + finalInterval
    )

  return {
    ...state,
    card: {
      ...state.card,
      due
    },
    dueDate: due.toISOString()
  }
}

function maybeApplyFriendlyFirstReviewInterval(
  state: FsrsCardState,
  rating: FsrsRating,
  reviewedAt: Date,
  isFirstReview: boolean
): FsrsCardState {

  if (!isFirstReview) {
    return state
  }

  return applyFriendlyFirstReviewInterval(
    state,
    rating,
    reviewedAt
  )
}

function createScheduler() {

  const savedParameters =
    loadFsrsParameters()

  if (
    savedParameters?.weights &&
    savedParameters.weights.length > 0
  ) {
    return fsrs(
      generatorParameters({
        w: savedParameters.weights,
        request_retention:
          savedParameters.requestRetention ?? 0.9
      })
    )
  }

  return fsrs()
}

function getScheduler() {
  return createScheduler()
}

function toTsFsrsRating(
  rating: FsrsRating
) {

  if (rating === "again") return Rating.Again
  if (rating === "hard") return Rating.Hard
  if (rating === "good") return Rating.Good

  return Rating.Easy
}

function getCardDueDate(card: any) {

  return new Date(
    card.due ?? card.dueDate ?? Date.now()
  ).toISOString()
}

function getReviewCount(card: any) {

  return Number(
    card.reps ?? card.reviewCount ?? 0
  )
}

function getLapseCount(card: any) {

  return Number(
    card.lapses ?? card.lapseCount ?? 0
  )
}

function createStateFromCard(
  card: any,
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

export function reviewFsrsCard(params: {
  cardId: string
  currentState?: FsrsCardState
  rating: FsrsRating
  reviewedAt?: Date
}) {

  const now =
    params.reviewedAt || new Date()

  const card =
    params.currentState?.card ||
    createEmptyCard(now)

  const result =
    getScheduler().next(
      card,
      now,
      toTsFsrsRating(params.rating)
    )

  let stateAfter =
    createStateFromCard(
      result.card,
      now
    )

  if (!params.currentState) {
    stateAfter =
      applyFriendlyFirstReviewInterval(
        stateAfter,
        params.rating,
        now
      )
  }

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
  currentState?: FsrsCardState
  reviewedAt?: Date
}) {

  const now =
    params.reviewedAt || new Date()

  const card =
    params.currentState?.card ||
    createEmptyCard(now)

  const preview =
    getScheduler().repeat(
      card,
      now
    )

  const again =
    createStateFromCard(
      preview[Rating.Again].card,
      now
    )

  const hard =
    createStateFromCard(
      preview[Rating.Hard].card,
      now
    )

  const good =
    createStateFromCard(
      preview[Rating.Good].card,
      now
    )

  const easy =
    createStateFromCard(
      preview[Rating.Easy].card,
      now
    )

  if (!params.currentState) {
    return {
      again:
        applyFriendlyFirstReviewInterval(
          again,
          "again",
          now
        ),
      hard:
        applyFriendlyFirstReviewInterval(
          hard,
          "hard",
          now
        ),
      good:
        applyFriendlyFirstReviewInterval(
          good,
          "good",
          now
        ),
      easy:
        applyFriendlyFirstReviewInterval(
          easy,
          "easy",
          now
        )
    }
  }

  return {
    again,
    hard,
    good,
    easy
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
  progress: FsrsProgressMap
) {

  return cards.filter(card =>
    isFsrsCardDue(
      card.id,
      progress
    )
  )
}

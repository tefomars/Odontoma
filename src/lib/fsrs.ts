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

  const stateAfter =
    createStateFromCard(
      result.card,
      now
    )

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

  return {
    again: createStateFromCard(
      preview[Rating.Again].card,
      now
    ),
    hard: createStateFromCard(
      preview[Rating.Hard].card,
      now
    ),
    good: createStateFromCard(
      preview[Rating.Good].card,
      now
    ),
    easy: createStateFromCard(
      preview[Rating.Easy].card,
      now
    )
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

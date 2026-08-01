import {
  get_fuzz_range
} from "ts-fsrs"

import type {
  FsrsCardState,
  FsrsProgressMap
} from "@/lib/fsrs"

const DAY_MS =
  24 * 60 * 60 * 1000

const MAXIMUM_INTERVAL_DAYS =
  36500

function localDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function getDailyLoad(
  progress: FsrsProgressMap,
  excludedCardId: string
) {
  const load =
    new Map<string, number>()

  for (const [cardId, state] of Object.entries(progress)) {
    if (cardId === excludedCardId) continue

    const due =
      new Date(state.dueDate)

    if (Number.isNaN(due.getTime())) continue

    const key =
      localDayKey(due)

    load.set(
      key,
      (load.get(key) || 0) + 1
    )
  }

  return load
}

function applyScheduledDate(
  state: FsrsCardState,
  due: Date,
  scheduledDays: number
): FsrsCardState {
  return {
    ...state,
    dueDate: due.toISOString(),
    card: {
      ...state.card,
      due,
      scheduled_days: scheduledDays
    }
  }
}

/**
 * Keeps FSRS' safe fuzz window, then selects the least-loaded day in it.
 * Every weekday is treated equally: there are intentionally no Easy Days.
 */
export function balanceFsrsDueDate(params: {
  cardId: string
  state: FsrsCardState
  progress: FsrsProgressMap
  reviewedAt: Date
}) {
  const idealDue =
    new Date(params.state.dueDate)

  const idealIntervalDays =
    (idealDue.getTime() - params.reviewedAt.getTime()) / DAY_MS

  if (
    Number.isNaN(idealDue.getTime()) ||
    idealIntervalDays < 2.5
  ) {
    return params.state
  }

  const elapsedDays =
    Math.max(
      0,
      Number(params.state.card?.elapsed_days || 0)
    )

  const range =
    get_fuzz_range(
      idealIntervalDays,
      elapsedDays,
      MAXIMUM_INTERVAL_DAYS
    )

  const dailyLoad =
    getDailyLoad(
      params.progress,
      params.cardId
    )

  const idealRounded =
    Math.round(idealIntervalDays)

  const candidates =
    Array.from(
      {
        length:
          range.max_ivl - range.min_ivl + 1
      },
      (_, index) => range.min_ivl + index
    )

  const selectedInterval =
    candidates
      .map(interval => {
        const due =
          new Date(
            params.reviewedAt.getTime() +
            interval * DAY_MS
          )

        const load =
          dailyLoad.get(localDayKey(due)) || 0

        const distance =
          Math.abs(interval - idealRounded)

        const tieBreaker =
          hashString(
            `${params.cardId}:${params.state.reviewCount}:${interval}`
          ) / 0xffffffff

        return {
          interval,
          score:
            load * 100 +
            distance * 2 +
            tieBreaker
        }
      })
      .sort((a, b) => a.score - b.score)[0]
      ?.interval ?? idealRounded

  const selectedDue =
    new Date(
      params.reviewedAt.getTime() +
      selectedInterval * DAY_MS
    )

  return applyScheduledDate(
    params.state,
    selectedDue,
    selectedInterval
  )
}

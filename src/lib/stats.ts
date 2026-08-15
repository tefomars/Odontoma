export type AnswerStats = {
  correct: number
  incorrect: number
  recent?: boolean[]
  lastAnsweredAt?: number
  lastCorrect?: boolean
  correctStreak?: number
}

export type OdontomaStats = {
  totalAnswered: number
  totalCorrect: number
  tags: Record<string, AnswerStats>
  questions: Record<string, AnswerStats>
}

function emptyStats(): OdontomaStats {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    tags: {},
    questions: {}
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizeAnswerStats(value: unknown) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      if (!isRecord(item)) return []

      return [[
        key,
        {
          correct: Math.max(0, Number(item.correct) || 0),
          incorrect: Math.max(0, Number(item.incorrect) || 0),
          ...(
            Array.isArray(item.recent)
              ? {
                  recent: item.recent
                    .filter(answer => typeof answer === "boolean")
                    .slice(-5)
                }
              : {}
          ),
          ...(
            Number(item.lastAnsweredAt) > 0
              ? { lastAnsweredAt: Number(item.lastAnsweredAt) }
              : {}
          ),
          ...(
            typeof item.lastCorrect === "boolean"
              ? { lastCorrect: item.lastCorrect }
              : {}
          ),
          ...(
            Number(item.correctStreak) >= 0
              ? { correctStreak: Math.max(0, Number(item.correctStreak) || 0) }
              : {}
          )
        }
      ]]
    })
  )
}

export function normalizeStats(value: unknown): OdontomaStats {
  if (!isRecord(value)) return emptyStats()

  return {
    totalAnswered: Math.max(0, Number(value.totalAnswered) || 0),
    totalCorrect: Math.max(0, Number(value.totalCorrect) || 0),
    tags: normalizeAnswerStats(value.tags),
    questions: normalizeAnswerStats(value.questions)
  }
}

export function loadStats(): OdontomaStats {

  const raw =
    localStorage.getItem(
      "odontoma_stats"
    )

  if (!raw) {

    return emptyStats()
  }

  try {
    return normalizeStats(JSON.parse(raw))
  } catch {
    return emptyStats()
  }
}

export function saveStats(stats: OdontomaStats) {

  localStorage.setItem(
    "odontoma_stats",
    JSON.stringify(stats)
  )
}

export function deleteQuestionStats(questionIds: string[]) {
  if (questionIds.length === 0) return

  const ids = new Set(questionIds)
  const stats = loadStats()

  stats.questions = Object.fromEntries(
    Object.entries(stats.questions).filter(
      ([questionId]) => !ids.has(questionId)
    )
  )

  saveStats(stats)
}

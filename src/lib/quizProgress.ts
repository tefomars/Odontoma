import type {
  AnswerStats,
  OdontomaStats
} from "@/lib/stats"

export type ProgressQuestion = {
  id: string
  chapter: string
  tags?: string[]
}

export type ProgressState =
  | "unseen"
  | "weak"
  | "learning"
  | "solid"

export type QuestionProgress = {
  attempts: number
  accuracy: number
  state: ProgressState
  lastCorrect?: boolean
  correctStreak: number
}

export type ProgressSummary = {
  total: number
  answered: number
  coverage: number
  accuracy: number
  solid: number
  weak: number
  learning: number
  unseen: number
}

function percentage(value: number) {
  return Math.round(value * 100)
}

function coveragePercentage(answered: number, total: number) {
  if (total === 0) return 0
  return Math.round((answered / total) * 1000) / 10
}

export function getQuestionProgress(
  answerStats?: Partial<AnswerStats>
): QuestionProgress {
  const correct = answerStats?.correct || 0
  const incorrect = answerStats?.incorrect || 0
  const attempts = correct + incorrect
  const recent = answerStats?.recent || []
  const accuracy =
    recent.length > 0
      ? recent.filter(Boolean).length / recent.length
      : attempts > 0
        ? correct / attempts
        : 0
  const lastCorrect =
    typeof answerStats?.lastCorrect === "boolean"
      ? answerStats.lastCorrect
      : incorrect === 0 && correct > 0
        ? true
        : undefined
  const correctStreak =
    answerStats?.correctStreak ??
    (incorrect === 0 ? Math.min(correct, 2) : 0)

  let state: ProgressState = "learning"

  if (attempts === 0) {
    state = "unseen"
  } else if (lastCorrect === false || accuracy < 0.6) {
    state = "weak"
  } else if (
    attempts >= 2 &&
    correctStreak >= 2 &&
    accuracy >= 0.75
  ) {
    state = "solid"
  }

  return {
    attempts,
    accuracy: percentage(accuracy),
    state,
    lastCorrect,
    correctStreak
  }
}

export function getProgressSummary(
  questions: ProgressQuestion[],
  stats: OdontomaStats
): ProgressSummary {
  const progress = questions.map(question =>
    getQuestionProgress(stats.questions?.[question.id])
  )
  const answered = progress.filter(item => item.attempts > 0)
  const accuracy = answered.length === 0
    ? 0
    : Math.round(
        answered.reduce((sum, item) => sum + item.accuracy, 0) /
        answered.length
      )

  return {
    total: progress.length,
    answered: answered.length,
    coverage: coveragePercentage(answered.length, questions.length),
    accuracy,
    solid: progress.filter(item => item.state === "solid").length,
    weak: progress.filter(item => item.state === "weak").length,
    learning: progress.filter(item => item.state === "learning").length,
    unseen: progress.filter(item => item.state === "unseen").length
  }
}

export function getPracticeQuestionIds(
  questions: ProgressQuestion[],
  stats: OdontomaStats,
  mode: "weak" | "unseen" | "recent"
) {
  return questions
    .filter(question => {
      const progress = getQuestionProgress(stats.questions?.[question.id])

      if (mode === "unseen") return progress.state === "unseen"
      if (mode === "recent") return progress.lastCorrect === false
      return progress.state === "weak"
    })
    .map(question => question.id)
}

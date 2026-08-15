import {
  shuffleArray
} from "@/lib/shuffleQuestion"

import {
  getQuestionProgress
} from "@/lib/quizProgress"

type QuestionWithId = {
  id: string
}

type QuestionStats = Record<
  string,
  {
    correct?: number
    incorrect?: number
    recent?: boolean[]
    lastAnsweredAt?: number
    lastCorrect?: boolean
    correctStreak?: number
  }
>

export function buildSmartQuizPool<T extends QuestionWithId>(
  questions: T[],
  stats: QuestionStats = {}
) {
  const recentIncorrect: T[] = []
  const weak: T[] = []
  const unseen: T[] = []
  const learning: T[] = []
  const staleSolid: T[] = []
  const solid: T[] = []
  const seenIds = new Set<string>()
  const staleThreshold = Date.now() - 14 * 24 * 60 * 60 * 1000

  for (const question of questions) {
    if (seenIds.has(question.id)) continue
    seenIds.add(question.id)

    const history = stats[question.id]

    const progress = getQuestionProgress(history)

    if (progress.lastCorrect === false) {
      recentIncorrect.push(question)
    } else if (progress.state === "weak") {
      weak.push(question)
    } else if (progress.state === "unseen") {
      unseen.push(question)
    } else if (progress.state === "learning") {
      learning.push(question)
    } else if (
      history?.lastAnsweredAt &&
      history.lastAnsweredAt < staleThreshold
    ) {
      staleSolid.push(question)
    } else {
      solid.push(question)
    }
  }

  return [
    ...shuffleArray(recentIncorrect),
    ...shuffleArray(weak),
    ...shuffleArray(unseen),
    ...shuffleArray(learning),
    ...shuffleArray(staleSolid),
    ...shuffleArray(solid)
  ]
}

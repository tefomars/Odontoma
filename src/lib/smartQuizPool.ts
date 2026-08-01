import {
  shuffleArray
} from "@/lib/shuffleQuestion"

type QuestionWithId = {
  id: string
}

type QuestionStats = Record<
  string,
  {
    correct?: number
    incorrect?: number
  }
>

export function buildSmartQuizPool<T extends QuestionWithId>(
  questions: T[],
  stats: QuestionStats = {}
) {
  const incorrect: T[] = []
  const unseen: T[] = []
  const correctOnly: T[] = []
  const seenIds = new Set<string>()

  for (const question of questions) {
    if (seenIds.has(question.id)) continue
    seenIds.add(question.id)

    const history = stats[question.id]

    if ((history?.incorrect || 0) > 0) {
      incorrect.push(question)
    } else if (!history) {
      unseen.push(question)
    } else {
      correctOnly.push(question)
    }
  }

  return [
    ...shuffleArray(incorrect),
    ...shuffleArray(unseen),
    ...shuffleArray(correctOnly)
  ]
}

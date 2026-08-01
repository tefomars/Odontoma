type QuizQuestion = {
  id: string
  [key: string]: unknown
}

export function refreshPausedQuizQuestions<T extends QuizQuestion>(
  savedQuestions: T[],
  currentQuestions: T[]
) {
  const currentById = new Map(
    currentQuestions.map(question => [question.id, question])
  )

  return savedQuestions
    .map(question => currentById.get(question.id))
    .filter((question): question is T => Boolean(question))
}

export function shuffleArray<T>(array: T[]) {

  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {

    const j =
      crypto.getRandomValues(
        new Uint32Array(1)
      )[0] % (i + 1)

    ;[copy[i], copy[j]] = [
      copy[j],
      copy[i]
    ]
  }

  return copy
}

export function shuffleQuestion(question: any) {

  const combined =
    question.options.map(
      (
        option: string,
        index: number
      ) => ({

        option,

        isCorrect:
          question.correctAnswers.includes(index)
      })
    )

  const shuffled =
    shuffleArray(combined)

  return {

    ...question,

    options:
      shuffled.map(
        (item: any) => item.option
      ),

    correctAnswers:
      shuffled
        .map(
          (item, index) =>

            (item as any).isCorrect
              ? index
              : null
        )
        .filter(
          item => item !== null
        )
  }
}

function longestRun(values: number[]) {
  let longest = 0
  let current = 0
  let previous: number | undefined

  for (const value of values) {
    current = value === previous ? current + 1 : 1
    previous = value
    longest = Math.max(longest, current)
  }

  return longest
}

function balancedPositions(count: number, optionCount: number) {
  const positions = Array.from({ length: optionCount }, (_, index) => index)
  const extraPositions = shuffleArray(positions)
  const baseCount = Math.floor(count / optionCount)
  const remainder = count % optionCount
  const pool = positions.flatMap(position =>
    Array.from(
      { length: baseCount + (extraPositions.indexOf(position) < remainder ? 1 : 0) },
      () => position
    )
  )

  let best = shuffleArray(pool)
  let bestRun = longestRun(best)

  for (let attempt = 0; attempt < 24 && bestRun > 2; attempt += 1) {
    const candidate = shuffleArray(pool)
    const candidateRun = longestRun(candidate)

    if (candidateRun < bestRun) {
      best = candidate
      bestRun = candidateRun
    }
  }

  return best
}

function placeSingleCorrectAnswer(question: any, targetIndex: number) {
  const correctIndex = question.correctAnswers[0]
  const correctOption = question.options[correctIndex]
  const distractors = question.options.filter((_: string, index: number) => index !== correctIndex)
  const options = shuffleArray(distractors)

  options.splice(targetIndex, 0, correctOption)

  return {
    ...question,
    options,
    correctAnswers: [targetIndex]
  }
}

export function shuffleQuestionsBalanced(questions: any[]) {
  const eligibleCounts = new Map<number, number>()

  for (const question of questions) {
    if (question.correctAnswers.length !== 1 || question.options.length < 2) continue
    eligibleCounts.set(
      question.options.length,
      (eligibleCounts.get(question.options.length) || 0) + 1
    )
  }

  const targets = new Map(
    [...eligibleCounts.entries()].map(([optionCount, count]) => [
      optionCount,
      balancedPositions(count, optionCount)
    ])
  )
  const targetIndexes = new Map<number, number>()

  return questions.map(question => {
    if (question.correctAnswers.length !== 1 || question.options.length < 2) {
      return shuffleQuestion(question)
    }

    const optionCount = question.options.length
    const targetIndex = targetIndexes.get(optionCount) || 0
    const targetPosition = targets.get(optionCount)?.[targetIndex]

    targetIndexes.set(optionCount, targetIndex + 1)

    return placeSingleCorrectAnswer(
      question,
      targetPosition ?? 0
    )
  })
}

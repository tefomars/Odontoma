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
        item => item.option
      ),

    correctAnswers:
      shuffled
        .map(
          (item, index) =>

            item.isCorrect
              ? index
              : null
        )
        .filter(
          item => item !== null
        )
  }
}

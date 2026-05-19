const DECKS_KEY =
  "odontoma_user_quiz_decks"

const QUESTIONS_KEY =
  "odontoma_user_quiz_questions"

export type UserQuizDeck = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type UserQuizQuestion = {
  id: string
  chapter: string
  difficulty: "easy" | "medium" | "hard"
  type: "single" | "multiple"
  question: string
  options: string[]
  correctAnswers: number[]
  explanation: string
}

export function loadUserQuizDecks(): UserQuizDeck[] {

  const raw =
    localStorage.getItem(DECKS_KEY)

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUserQuizDecks(
  decks: UserQuizDeck[]
) {

  localStorage.setItem(
    DECKS_KEY,
    JSON.stringify(decks)
  )
}

export function createUserQuizDeck(params: {
  name: string
  description?: string
}) {

  const now =
    new Date().toISOString()

  const deck: UserQuizDeck = {
    id: `quiz-deck-${Date.now()}-${crypto.randomUUID()}`,
    name: params.name.trim(),
    description: params.description?.trim() || "",
    createdAt: now,
    updatedAt: now
  }

  saveUserQuizDecks([
    ...loadUserQuizDecks(),
    deck
  ])

  return deck
}

export function deleteUserQuizDeck(
  deckId: string
) {

  saveUserQuizDecks(
    loadUserQuizDecks().filter(deck => deck.id !== deckId)
  )

  saveUserQuizQuestions(
    loadUserQuizQuestions().filter(question => question.chapter !== deckId)
  )
}

export function loadUserQuizQuestions(): UserQuizQuestion[] {

  const raw =
    localStorage.getItem(QUESTIONS_KEY)

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUserQuizQuestions(
  questions: UserQuizQuestion[]
) {

  localStorage.setItem(
    QUESTIONS_KEY,
    JSON.stringify(questions)
  )
}

export function getUserQuizQuestionsByDeck(
  deckId: string
) {

  return loadUserQuizQuestions().filter(
    question => question.chapter === deckId
  )
}

export function addUserQuizQuestion(params: {
  deckId: string
  question: string
  options: string[]
  correctAnswers: number[]
  explanation?: string
  difficulty?: "easy" | "medium" | "hard"
}) {

  const cleanOptions =
    params.options
      .map(option => option.trim())
      .filter(Boolean)

  const type =
    params.correctAnswers.length > 1
      ? "multiple"
      : "single"

  const question: UserQuizQuestion = {
    id: `user-quiz-${Date.now()}-${crypto.randomUUID()}`,
    chapter: params.deckId,
    difficulty: params.difficulty || "medium",
    type,
    question: params.question.trim(),
    options: cleanOptions,
    correctAnswers: params.correctAnswers,
    explanation: params.explanation?.trim() || ""
  }

  saveUserQuizQuestions([
    ...loadUserQuizQuestions(),
    question
  ])

  const now =
    new Date().toISOString()

  saveUserQuizDecks(
    loadUserQuizDecks().map(deck =>
      deck.id === params.deckId
        ? {
            ...deck,
            updatedAt: now
          }
        : deck
    )
  )

  return question
}

export function deleteUserQuizQuestion(
  questionId: string
) {

  saveUserQuizQuestions(
    loadUserQuizQuestions().filter(question => question.id !== questionId)
  )
}

export function importUserQuizQuestionsFromTabText(params: {
  deckId: string
  text: string
}) {

  const imported = []

  const lines =
    params.text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)

  for (const line of lines) {

    const parts =
      line.split("\t").map(part => part.trim())

    const [
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctRaw,
      explanationRaw
    ] = parts

    const options =
      [optionA, optionB, optionC, optionD]
        .filter(Boolean)

    const correctAnswers =
      (correctRaw || "")
        .split(",")
        .map(value => Number(value.trim()) - 1)
        .filter(value =>
          Number.isInteger(value) &&
          value >= 0 &&
          value < options.length
        )

    if (
      !question ||
      options.length < 2 ||
      correctAnswers.length === 0
    ) {
      continue
    }

    imported.push(
      addUserQuizQuestion({
        deckId: params.deckId,
        question,
        options,
        correctAnswers,
        explanation: explanationRaw || ""
      })
    )
  }

  return imported
}

export function exportUserQuizQuestionsToTabText(
  deckId: string
) {

  return getUserQuizQuestionsByDeck(deckId)
    .map(question => {
      const options =
        [
          question.options[0] || "",
          question.options[1] || "",
          question.options[2] || "",
          question.options[3] || ""
        ].map(value => value.replace(/\r?\n/g, " "))

      const correct =
        question.correctAnswers
          .map(index => index + 1)
          .join(",")

      return [
        question.question.replace(/\r?\n/g, " "),
        ...options,
        correct,
        question.explanation.replace(/\r?\n/g, " ")
      ].join("\t")
    })
    .join("\n")
}

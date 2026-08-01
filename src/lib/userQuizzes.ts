import {
  parseDelimitedRows,
  serializeDelimitedRows
} from "@/lib/delimitedText"

import {
  deleteQuestionStats
} from "@/lib/stats"

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

  const deletedQuestionIds =
    loadUserQuizQuestions()
      .filter(question => question.chapter === deckId)
      .map(question => question.id)

  saveUserQuizDecks(
    loadUserQuizDecks().filter(deck => deck.id !== deckId)
  )

  saveUserQuizQuestions(
    loadUserQuizQuestions().filter(question => question.chapter !== deckId)
  )

  deleteQuestionStats(deletedQuestionIds)
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

  const indexedOptions =
    params.options
      .map((option, index) => ({
        originalIndex: index,
        value: option.trim()
      }))
      .filter(option => option.value)

  const cleanOptions =
    indexedOptions.map(option => option.value)

  const indexMap =
    new Map(
      indexedOptions.map((option, index) => [
        option.originalIndex,
        index
      ])
    )

  const cleanCorrectAnswers =
    Array.from(
      new Set(
        params.correctAnswers.flatMap(index => {
          const mapped = indexMap.get(index)
          return mapped === undefined ? [] : [mapped]
        })
      )
    )

  const type =
    cleanCorrectAnswers.length > 1
      ? "multiple"
      : "single"

  const question: UserQuizQuestion = {
    id: `user-quiz-${Date.now()}-${crypto.randomUUID()}`,
    chapter: params.deckId,
    difficulty: params.difficulty || "medium",
    type,
    question: params.question.trim(),
    options: cleanOptions,
    correctAnswers: cleanCorrectAnswers,
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

  deleteQuestionStats([questionId])
}

export function importUserQuizQuestionsFromTabText(params: {
  deckId: string
  text: string
}) {

  const imported: UserQuizQuestion[] = []

  const rows =
    parseDelimitedRows(params.text, "\t")

  for (const parts of rows) {

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
      [optionA || "", optionB || "", optionC || "", optionD || ""]

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
      options.filter(Boolean).length < 2 ||
      correctAnswers.length === 0
    ) {
      continue
    }

    const indexedOptions =
      options
        .map((option, index) => ({ index, value: option.trim() }))
        .filter(option => option.value)

    const indexMap =
      new Map(
        indexedOptions.map((option, index) => [option.index, index])
      )

    const normalizedCorrect =
      Array.from(new Set(correctAnswers.flatMap(index => {
        const mapped = indexMap.get(index)
        return mapped === undefined ? [] : [mapped]
      })))

    if (normalizedCorrect.length === 0) continue

    imported.push({
      id: `user-quiz-${Date.now()}-${crypto.randomUUID()}`,
      chapter: params.deckId,
      difficulty: "medium",
      type: normalizedCorrect.length > 1 ? "multiple" : "single",
      question: question.trim(),
      options: indexedOptions.map(option => option.value),
      correctAnswers: normalizedCorrect,
      explanation: explanationRaw?.trim() || ""
    })
  }

  if (imported.length > 0) {
    saveUserQuizQuestions([
      ...loadUserQuizQuestions(),
      ...imported
    ])

    const updatedAt = new Date().toISOString()
    saveUserQuizDecks(
      loadUserQuizDecks().map(deck =>
        deck.id === params.deckId
          ? { ...deck, updatedAt }
          : deck
      )
    )
  }

  return imported
}

export function exportUserQuizQuestionsToTabText(
  deckId: string
) {

  return serializeDelimitedRows(
    getUserQuizQuestionsByDeck(deckId).map(question => {
      const options =
        [
          question.options[0] || "",
          question.options[1] || "",
          question.options[2] || "",
          question.options[3] || ""
        ]

      const correct =
        question.correctAnswers
          .map(index => index + 1)
          .join(",")

      return [
        question.question,
        ...options,
        correct,
        question.explanation
      ]
    }),
    "\t"
  )
}

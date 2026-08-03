import {
  parseDelimitedRows,
  serializeDelimitedRows
} from "@/lib/delimitedText"

import {
  deleteQuestionStats
} from "@/lib/stats"

import type { OpenQuizDeck } from "@/content/openQuizzes"

const DECKS_KEY =
  "odontoma_user_quiz_decks"

const QUESTIONS_KEY =
  "odontoma_user_quiz_questions"

export const USER_QUIZ_BUNDLE_VERSION = 1

export type UserQuizMode =
  | "multiple-choice"
  | "open-ended"

export type UserQuizDeck = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  mode?: UserQuizMode
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
  modelAnswer?: string
  acceptedPoints?: string[]
}

export type UserQuizBundle = {
  app: "Odontoma"
  kind: "quiz"
  version: 1
  exportedAt: string
  deck: {
    name: string
    description?: string
    mode: UserQuizMode
  }
  questions: Array<{
    question: string
    difficulty: "easy" | "medium" | "hard"
    options?: string[]
    correctAnswers?: number[]
    explanation?: string
    modelAnswer?: string
    acceptedPoints?: string[]
  }>
}

export function getUserQuizDeckMode(deck?: UserQuizDeck): UserQuizMode {
  return deck?.mode === "open-ended"
    ? "open-ended"
    : "multiple-choice"
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
  mode?: UserQuizMode
}) {

  const now =
    new Date().toISOString()

  const deck: UserQuizDeck = {
    id: `quiz-deck-${Date.now()}-${crypto.randomUUID()}`,
    name: params.name.trim(),
    description: params.description?.trim() || "",
    createdAt: now,
    updatedAt: now,
    mode: params.mode || "multiple-choice"
  }

  saveUserQuizDecks([
    ...loadUserQuizDecks(),
    deck
  ])

  return deck
}

function touchUserQuizDeck(deckId: string) {
  const updatedAt = new Date().toISOString()

  saveUserQuizDecks(
    loadUserQuizDecks().map(deck =>
      deck.id === deckId
        ? { ...deck, updatedAt }
        : deck
    )
  )
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

export function getUserOpenQuizDeck(deckId: string): OpenQuizDeck | null {
  const deck = loadUserQuizDecks().find(item => item.id === deckId)
  if (!deck || getUserQuizDeckMode(deck) !== "open-ended") return null

  return {
    id: deck.id,
    title: deck.name,
    subject: "Quiz personal",
    description: deck.description,
    questions: getUserQuizQuestionsByDeck(deckId)
      .filter(question => Boolean(question.question.trim() && question.modelAnswer?.trim()))
      .map(question => ({
        id: question.id,
        prompt: question.question,
        modelAnswer: question.modelAnswer || "",
        acceptedPoints: question.acceptedPoints || [],
        explanation: question.explanation
      }))
  }
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

  touchUserQuizDeck(params.deckId)

  return question
}

export function addUserOpenQuizQuestion(params: {
  deckId: string
  question: string
  modelAnswer: string
  acceptedPoints?: string[]
  explanation?: string
  difficulty?: "easy" | "medium" | "hard"
}) {
  const question: UserQuizQuestion = {
    id: `user-open-quiz-${Date.now()}-${crypto.randomUUID()}`,
    chapter: params.deckId,
    difficulty: params.difficulty || "medium",
    type: "single",
    question: params.question.trim(),
    options: [],
    correctAnswers: [],
    explanation: params.explanation?.trim() || "",
    modelAnswer: params.modelAnswer.trim(),
    acceptedPoints: (params.acceptedPoints || [])
      .map(point => point.trim())
      .filter(Boolean)
  }

  saveUserQuizQuestions([
    ...loadUserQuizQuestions(),
    question
  ])

  touchUserQuizDeck(params.deckId)
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

    touchUserQuizDeck(params.deckId)
  }

  return imported
}

export function importUserOpenQuizQuestionsFromTabText(params: {
  deckId: string
  text: string
}) {
  const imported: UserQuizQuestion[] = []
  const rows = parseDelimitedRows(params.text, "\t")

  for (const parts of rows) {
    const [question, modelAnswer, acceptedPointsRaw, explanationRaw] = parts

    if (!question?.trim() || !modelAnswer?.trim()) continue

    imported.push({
      id: `user-open-quiz-${Date.now()}-${crypto.randomUUID()}`,
      chapter: params.deckId,
      difficulty: "medium",
      type: "single",
      question: question.trim(),
      options: [],
      correctAnswers: [],
      explanation: explanationRaw?.trim() || "",
      modelAnswer: modelAnswer.trim(),
      acceptedPoints: (acceptedPointsRaw || "")
        .split("|")
        .map(point => point.trim())
        .filter(Boolean)
    })
  }

  if (imported.length > 0) {
    saveUserQuizQuestions([
      ...loadUserQuizQuestions(),
      ...imported
    ])

    touchUserQuizDeck(params.deckId)
  }

  return imported
}

export function exportUserQuizBundle(deckId: string): UserQuizBundle {
  const deck = loadUserQuizDecks().find(item => item.id === deckId)

  if (!deck) {
    throw new Error("No se encontró el quiz.")
  }

  const mode = getUserQuizDeckMode(deck)

  return {
    app: "Odontoma",
    kind: "quiz",
    version: USER_QUIZ_BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description,
      mode
    },
    questions: getUserQuizQuestionsByDeck(deckId).map(question => ({
      question: question.question,
      difficulty: question.difficulty,
      options: mode === "multiple-choice" ? question.options : undefined,
      correctAnswers: mode === "multiple-choice" ? question.correctAnswers : undefined,
      explanation: question.explanation,
      modelAnswer: mode === "open-ended" ? question.modelAnswer : undefined,
      acceptedPoints: mode === "open-ended" ? question.acceptedPoints : undefined
    }))
  }
}

function isUserQuizBundle(value: unknown): value is UserQuizBundle {
  if (!value || typeof value !== "object") return false
  const bundle = value as Partial<UserQuizBundle>
  const deck = bundle.deck as Partial<UserQuizBundle["deck"]> | undefined

  return bundle.app === "Odontoma" &&
    bundle.kind === "quiz" &&
    bundle.version === USER_QUIZ_BUNDLE_VERSION &&
    Boolean(deck) &&
    typeof deck?.name === "string" &&
    (deck.mode === "multiple-choice" || deck.mode === "open-ended") &&
    Array.isArray(bundle.questions)
}

export function importUserQuizBundle(text: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("El archivo no contiene un quiz válido de Odontoma.")
  }

  if (!isUserQuizBundle(parsed)) {
    throw new Error("El archivo no es compatible con Quiz Studio.")
  }

  const deck = createUserQuizDeck({
    name: parsed.deck.name,
    description: parsed.deck.description,
    mode: parsed.deck.mode
  })

  const imported: UserQuizQuestion[] = []

  for (const source of parsed.questions) {
    if (!source || typeof source.question !== "string") continue

    if (parsed.deck.mode === "open-ended") {
      if (typeof source.modelAnswer !== "string" || !source.modelAnswer.trim()) continue
      imported.push(addUserOpenQuizQuestion({
        deckId: deck.id,
        question: source.question,
        modelAnswer: source.modelAnswer,
        acceptedPoints: Array.isArray(source.acceptedPoints) ? source.acceptedPoints : [],
        explanation: source.explanation,
        difficulty: source.difficulty
      }))
      continue
    }

    if (!Array.isArray(source.options) || !Array.isArray(source.correctAnswers)) continue
    if (source.options.filter(option => typeof option === "string" && option.trim()).length < 2) continue

    const correctAnswers = source.correctAnswers.filter(index =>
      Number.isInteger(index) && index >= 0 && index < (source.options?.length || 0)
    )
    if (correctAnswers.length === 0) continue

    imported.push(addUserQuizQuestion({
      deckId: deck.id,
      question: source.question,
      options: source.options,
      correctAnswers,
      explanation: source.explanation,
      difficulty: source.difficulty
    }))
  }

  return { deck, questions: imported }
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

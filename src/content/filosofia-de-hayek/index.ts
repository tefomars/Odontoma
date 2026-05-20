import filosofiaDeHayekFlashcards from "@/content/flashcards/filosofia-de-hayek/cards"

import {
  estudioFinalHayekQuestions
} from "./estudioFinalQuestions"

function getDifficulty(chapter: string) {
  if (chapter === "Parcial 1") return "easy"
  if (chapter === "Parcial 2") return "medium"
  return "hard"
}

function getDistractors(
  correctAnswer: string,
  chapter: string,
  index: number
) {
  const sameChapter =
    filosofiaDeHayekFlashcards
      .filter(card =>
        card.chapter === chapter &&
        card.back !== correctAnswer
      )
      .map(card => card.back)

  const allAnswers =
    filosofiaDeHayekFlashcards
      .filter(card => card.back !== correctAnswer)
      .map(card => card.back)

  const pool =
    sameChapter.length >= 3
      ? sameChapter
      : allAnswers

  return [
    pool[(index + 1) % pool.length],
    pool[(index + 7) % pool.length],
    pool[(index + 13) % pool.length]
  ].filter(Boolean)
}

const flashcardQuizQuestions =
  filosofiaDeHayekFlashcards.map((card, index) => ({
    id: `quiz-${card.id}`,
    chapter: card.chapter,
    topic: card.topic,
    tags: card.tags || ["filosofia", "hayek"],
    difficulty: getDifficulty(card.chapter),
    type: "single",
    question: card.front,
    options: [
      card.back,
      ...getDistractors(
        card.back,
        card.chapter,
        index
      )
    ],
    correctAnswers: [0],
    explanation: card.back
  }))

const finalQuizQuestions =
  estudioFinalHayekQuestions.map((question: any) => ({
    ...question,
    id: question.id.startsWith("hayek-final-")
      ? question.id
      : `hayek-final-${question.id}`,
    chapter: "Estudio para Final",
    topic: question.topic || "Estudio para Final",
    tags: Array.from(
      new Set([
        ...(question.tags || []),
        "filosofia",
        "hayek",
        "estudio-final",
        "quiz-manual"
      ])
    )
  }))

export const questions = [
  ...flashcardQuizQuestions,
  ...finalQuizQuestions
]

export const questionCountsByChapter =
  questions.reduce(
    (counts, question) => ({
      ...counts,
      [question.chapter]:
        (counts[question.chapter] || 0) + 1
    }),
    {} as Record<string, number>
  )

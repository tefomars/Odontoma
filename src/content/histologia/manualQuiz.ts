import type { HistologiaQuizQuestion } from "./quizFromFlashcards"

export type ManualQuizSeed = {
  id: string
  topic: string
  difficulty: HistologiaQuizQuestion["difficulty"]
  question: string
  correct: string
  distractors: [string, string, string]
  explanation: string
}

export type ManualQuizRow = readonly [
  id: string,
  topic: string,
  difficulty: HistologiaQuizQuestion["difficulty"],
  question: string,
  correct: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string
]

export function createManualQuizBank(
  chapter: string,
  seeds: ManualQuizSeed[]
): HistologiaQuizQuestion[] {
  return seeds.map(seed => ({
    id: `quiz-${seed.id}`,
    chapter,
    topic: seed.topic,
    difficulty: seed.difficulty,
    type: "single",
    question: seed.question,
    options: [seed.correct, ...seed.distractors],
    correctAnswers: [0],
    explanation: seed.explanation,
    tags: [chapter, seed.topic, "Banco manual"]
  }))
}

export function createManualQuizBankFromRows(
  chapter: string,
  rows: readonly ManualQuizRow[]
): HistologiaQuizQuestion[] {
  return createManualQuizBank(
    chapter,
    rows.map(
      ([id, topic, difficulty, question, correct, distractor1, distractor2, distractor3, explanation]) => ({
        id,
        topic,
        difficulty,
        question,
        correct,
        distractors: [distractor1, distractor2, distractor3],
        explanation
      })
    )
  )
}

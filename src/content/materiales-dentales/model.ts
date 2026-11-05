import type { Flashcard } from "../flashcards/histologia/cards"
import type { StudyQuestion } from "../studio/schema"

type Source = number | readonly number[]
export type CardDraft = readonly [id: string, source: Source, subtopic: string, front: string, back: string]
export type QuizDraft = readonly [id: string, source: Source, topic: string, question: string, options: readonly [string, string, string, string], explanation: string, difficulty?: "easy" | "medium" | "hard"]

/** Every front, answer and distractor is individually authored below. Only IDs,
 * metadata and display positions are assembled here, never educational text. */
export function block(id: string, title: string, partial: 1 | 2, description: string, cardDrafts: readonly CardDraft[], quizDrafts: readonly QuizDraft[]) {
  const chapter = `md-${id}`
  const offset = ({ amalgamas: 2, "glosario-p2": 2, adhesivos: 2, ionomeros: 2 } as Record<string, number>)[id] || 0
  const cards: Flashcard[] = cardDrafts.map(([key, , subtopic, front, back]) => ({ id: `${chapter}-f-${key}`, subject: "Materiales dentales", book: "Materiales dentales", chapter, topic: title, subtopic, front, back, tags: [`Parcial ${partial}`] }))
  const questions: StudyQuestion[] = quizDrafts.map(([key, , topic, question, choices, explanation, difficulty = "medium"]) => {
    const position = (Number(key) - 1 + offset) % 4
    const options = [...choices]
    options.splice(position, 0, options.shift()!)
    return { id: `${chapter}-q-${key}`, chapter, topic, question, options, explanation, correctAnswers: [position], difficulty, type: "single" }
  })
  return { id: chapter, title, partial, description, cards, questions, cardDrafts, quizDrafts }
}

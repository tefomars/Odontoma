export type OpenQuizQuestion = {
  id: string
  prompt: string
  modelAnswer: string
  acceptedPoints: string[]
  explanation?: string
  source?: string
}

export type OpenQuizDeck = {
  id: string
  title: string
  subject: string
  description?: string
  questions: OpenQuizQuestion[]
}

export type OpenQuizContent = {
  decks: OpenQuizDeck[]
}

export type OpenQuizGrade = "incorrect" | "partial" | "correct"

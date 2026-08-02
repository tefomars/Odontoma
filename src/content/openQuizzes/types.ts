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
  color?: string
  classSymbol?: string
  classColor?: string
  description?: string
  questions: OpenQuizQuestion[]
}

export type OpenQuizClass = {
  id: string
  name: string
  symbol: string
  color: string
}

export type OpenQuizContent = {
  classes?: OpenQuizClass[]
  decks: OpenQuizDeck[]
}

export type OpenQuizGrade = "incorrect" | "partial" | "correct"

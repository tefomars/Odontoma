export type OpenQuizQuestion = {
  image?: string
  imageAlt?: string
  backImage?: string
  backImageAlt?: string
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
  partial?: number | null
  /** Undefined preserves legacy partial grouping; null explicitly means ungrouped. */
  categoryId?: string | null
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
  categories?: OpenQuizCategory[]
}

export type OpenQuizCategory = { id: string; name: string }

export type OpenQuizContent = {
  classes?: OpenQuizClass[]
  decks: OpenQuizDeck[]
}

export type OpenQuizGrade = "incorrect" | "partial" | "correct"

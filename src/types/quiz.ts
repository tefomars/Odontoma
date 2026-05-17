export type Question = {
  id: string
  chapter: string
  topic: string

  difficulty: "easy" | "medium" | "hard"

  question: string

  options: string[]

  correctAnswer: number

  explanation: string

  tags: string[]
}

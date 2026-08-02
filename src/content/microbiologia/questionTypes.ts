export type MicrobiologyDifficulty = "easy" | "medium" | "hard"

export type MicrobiologyQuestion = {
  id: string
  chapter: string
  topic: string
  tags: string[]
  difficulty: MicrobiologyDifficulty
  type: "single"
  question: string
  options: string[]
  correctAnswers: number[]
  explanation: string
}

export function mcq(
  id: string,
  chapter: string,
  topic: string,
  difficulty: MicrobiologyDifficulty,
  question: string,
  options: [string, string, string, string],
  answer: number,
  explanation: string
): MicrobiologyQuestion {
  return {
    id,
    chapter,
    topic,
    tags: ["microbiologia", chapter.toLowerCase().replaceAll(" ", "-"), topic.toLowerCase().replaceAll(" ", "-")],
    difficulty,
    type: "single",
    question,
    options,
    correctAnswers: [answer],
    explanation
  }
}

export function trueFalse(
  id: string,
  chapter: string,
  topic: string,
  difficulty: MicrobiologyDifficulty,
  statement: string,
  isTrue: boolean,
  explanation: string
): MicrobiologyQuestion {
  return {
    id,
    chapter,
    topic,
    tags: ["microbiologia", chapter.toLowerCase().replaceAll(" ", "-"), topic.toLowerCase().replaceAll(" ", "-")],
    difficulty,
    type: "single",
    question: statement,
    options: ["Verdadero", "Falso"],
    correctAnswers: [isTrue ? 0 : 1],
    explanation
  }
}

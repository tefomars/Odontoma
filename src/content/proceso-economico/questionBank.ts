import type { StudyQuestion } from "../studio/schema"

// The first alternative in each authored row is the key. This helper only
// distributes its display position; it never creates or borrows distractors.
export type QuestionDraft = readonly [
  id: string, topic: string, question: string,
  alternatives: readonly [string, string, string, string],
  explanation: string, difficulty?: "easy" | "medium" | "hard",
]

export function defineQuestions(prefix: string, chapter: string, drafts: readonly QuestionDraft[]): StudyQuestion[] {
  return drafts.map(([id, topic, question, alternatives, explanation, difficulty = "medium"]) => {
    // IDs are explicit and append-only: editing or reordering a question must
    // not move another question's saved progress to it.
    const position = (Number(id) - 1) % 4
    const options = [...alternatives]
    options.splice(position, 0, options.shift()!)
    return { id: `${prefix}-${id}`, chapter, topic, difficulty, type: "single", question, options, correctAnswers: [position], explanation }
  })
}

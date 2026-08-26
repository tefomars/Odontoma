import { semiologiaQuestions } from "./questions"

export const questions = semiologiaQuestions

export const questionCountsByChapter = questions.reduce<Record<string, number>>(
  (counts, question) => {
    counts[question.chapter] = (counts[question.chapter] || 0) + 1
    return counts
  },
  {}
)

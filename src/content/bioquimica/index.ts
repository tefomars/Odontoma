import { bioquimicaQuestions } from "./questions"

export const questions = bioquimicaQuestions

export const questionCountsByChapter = questions.reduce<Record<string, number>>((counts, question) => {
  counts[question.chapter] = (counts[question.chapter] || 0) + 1
  return counts
}, {})

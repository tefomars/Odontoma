import { cap18Questions } from "./cap18/questions"
import { cap20Questions } from "./cap20/questions"

export const questions = [
  ...cap18Questions,
  ...cap20Questions
]

export const questionCountsByChapter = {
  "Capítulo 18": cap18Questions.length,
  "Capítulo 20": cap20Questions.length
}

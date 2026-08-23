import { cap14Questions } from "./cap14/questions"
import { cap18Questions } from "./cap18/questions"
import { cap19Questions } from "./cap19/questions"
import { cap20Questions } from "./cap20/questions"

export const questions = [
  ...cap14Questions,
  ...cap18Questions,
  ...cap19Questions,
  ...cap20Questions
]

export const questionCountsByChapter = {
  "Capítulo 14": cap14Questions.length,
  "Capítulo 18": cap18Questions.length,
  "Capítulo 19": cap19Questions.length,
  "Capítulo 20": cap20Questions.length
}

import { cap4Questions } from "./cap4/questions"
import { cap5Questions } from "./cap5/questions"
import { cap6Questions } from "./cap6/questions"
import { cap7Questions } from "./cap7/questions"
import { cap8Questions } from "./cap8/questions"

export const questions = [
  ...cap4Questions,
  ...cap5Questions,
  ...cap6Questions,
  ...cap7Questions,
  ...cap8Questions
]

export const questionCountsByChapter = {
  "Capítulo 4": cap4Questions.length,
  "Capítulo 5": cap5Questions.length,
  "Capítulo 6": cap6Questions.length,
  "Capítulo 7": cap7Questions.length,
  "Capítulo 8": cap8Questions.length,
  "Capítulo 9": 0,
  "Capítulo 10": 0,
  "Capítulo 11": 0,
  "Capítulo 12": 0
}

import { cap4Questions } from "./cap4/questions"
import { cap5Questions } from "./cap5/questions"
import { cap6Questions } from "./cap6/questions"
import { cap7Questions } from "./cap7/questions"
import { cap8Questions } from "./cap8/questions"
import { cap9Questions } from "./cap9/questions"
import { cap10Questions } from "./cap10/questions"
import { cap11Questions } from "./cap11/questions"
import { cap12Questions } from "./cap12/questions"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { cap16Questions } from "./cap16/questions"
import { cap17Questions } from "./cap17/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"

export const questions = [
  ...cap4Questions,
  ...cap5Questions,
  ...cap6Questions,
  ...cap7Questions,
  ...cap8Questions,
  ...cap9Questions,
  ...cap10Questions,
  ...cap11Questions,
  ...cap12Questions,
  ...cap13Questions,
  ...cap14Questions,
  ...cap15Questions,
  ...cap16Questions,
  ...cap17Questions,
  ...hemostasiaQuestions
]

export const questionCountsByChapter = {
  "Capítulo 4": cap4Questions.length,
  "Capítulo 5": cap5Questions.length,
  "Capítulo 6": cap6Questions.length,
  "Capítulo 7": cap7Questions.length,
  "Capítulo 8": cap8Questions.length,
  "Capítulo 9": cap9Questions.length,
  "Capítulo 10": cap10Questions.length,
  "Capítulo 11": cap11Questions.length,
  "Capítulo 12": cap12Questions.length,
  "Capítulo 13": cap13Questions.length,
  "Capítulo 14": cap14Questions.length,
  "Capítulo 15": cap15Questions.length,
  "Capítulo 16": cap16Questions.length,
  "Capítulo 17": cap17Questions.length,
  "Artículo · Hemostasia y trombosis": hemostasiaQuestions.length
}

import { articuloHemostasiaFlashcards } from "@/content/flashcards/histologia/articuloHemostasia"
import {
  createQuizQuestionsFromFlashcards,
  selectImportantFlashcards
} from "../quizFromFlashcards"

export const hemostasiaQuestions =
  createQuizQuestionsFromFlashcards(
    selectImportantFlashcards(articuloHemostasiaFlashcards)
  )

import { cap14Flashcards } from "@/content/flashcards/histologia/cap14"
import {
  createQuizQuestionsFromFlashcards,
  selectImportantFlashcards
} from "../quizFromFlashcards"

export const cap14Questions =
  createQuizQuestionsFromFlashcards(
    selectImportantFlashcards(cap14Flashcards),
    cap14Flashcards
  )

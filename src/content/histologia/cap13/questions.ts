import { cap13Flashcards } from "@/content/flashcards/histologia/cap13"
import {
  createQuizQuestionsFromFlashcards,
  selectImportantFlashcards
} from "../quizFromFlashcards"

export const cap13Questions =
  createQuizQuestionsFromFlashcards(
    selectImportantFlashcards(cap13Flashcards)
  )

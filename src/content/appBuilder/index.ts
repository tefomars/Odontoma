import data from "./subjects.json"

import type { HomeContent } from "./types"

export const homeContent = data as HomeContent
export const homeSubjects = homeContent.subjects
export const mainMenuContent = homeContent.mainMenu
export const quizMenuContent = homeContent.quizMenu

export type {
  AppMenuCard,
  AppMenuDestination,
  FlashcardSubjectBlock,
  FlashcardSubjectDestination,
  HomeContent,
  HomeSubject,
  MainMenuContent,
  QuizMenuContent,
  SubjectDestination
} from "./types"

import data from "./subjects.json"
import { getStudyBank } from "../studio/catalog"

import type { HomeContent } from "./types"

export const homeContent = data as HomeContent
export const homeSubjects = homeContent.subjects.filter(s => !s.hidden && getStudyBank(s.destination)?.enabled !== false)
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

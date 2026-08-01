import data from "./data.json"

import type { OpenQuizContent } from "./types"

export const openQuizContent = data as OpenQuizContent

export const openQuizDecks = openQuizContent.decks

export const openQuizClasses = openQuizContent.classes || []

export type {
  OpenQuizContent,
  OpenQuizClass,
  OpenQuizDeck,
  OpenQuizGrade,
  OpenQuizQuestion
} from "./types"

import data from "./data.json"

import type { OpenQuizContent } from "./types"
import {
  semiologiaOpenQuizClass,
  semiologiaOpenQuizDecks
} from "./semiologia"

export const openQuizContent = data as OpenQuizContent

export const openQuizDecks = [
  ...openQuizContent.decks,
  ...semiologiaOpenQuizDecks
]

export const openQuizClasses = [
  ...(openQuizContent.classes || []),
  semiologiaOpenQuizClass
]

export type {
  OpenQuizContent,
  OpenQuizClass,
  OpenQuizDeck,
  OpenQuizGrade,
  OpenQuizQuestion
} from "./types"

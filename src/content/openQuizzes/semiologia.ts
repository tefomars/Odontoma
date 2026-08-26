import data from "./data.json"

import type { OpenQuizClass, OpenQuizContent, OpenQuizDeck } from "./types"

const content = data as OpenQuizContent

export const semiologiaOpenQuizClass = content.classes?.find(
  item => item.id === "semiologia"
) as OpenQuizClass

export const semiologiaOpenQuizDecks = content.decks.filter(
  deck => deck.subject === "Semiología"
) as OpenQuizDeck[]

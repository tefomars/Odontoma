import type { OpenQuizCategory, OpenQuizContent, OpenQuizDeck } from "./types"
import { getOpenQuizPartial } from "./partials"

export function writtenCategoryId(deck: OpenQuizDeck): string | null {
  if (deck.categoryId !== undefined) return deck.categoryId
  const partial = getOpenQuizPartial(deck)
  return partial === null ? null : `partial:${partial}`
}

/** Definitions carry manual order; legacy partials remain visible without rewriting content. */
export function groupWrittenDecks(decks: OpenQuizDeck[], definitions: OpenQuizCategory[] = []) {
  const categories = definitions.map(category => ({ ...category, decks: [] as OpenQuizDeck[] }))
  const known = new Set(categories.map(category => category.id))
  const legacy = [...new Set(decks.filter(deck => deck.categoryId === undefined).map(getOpenQuizPartial).filter((n): n is number => n !== null))].sort((a, b) => a - b)
  for (const number of legacy) {
    const id = `partial:${number}`
    if (!known.has(id)) { categories.push({ id, name: `Parcial ${number}`, decks: [] }); known.add(id) }
  }
  const ungrouped: OpenQuizDeck[] = []
  for (const deck of decks) {
    const category = categories.find(item => item.id === writtenCategoryId(deck))
    if (category) category.decks.push(deck)
    else ungrouped.push(deck)
  }
  return { categories, ungrouped }
}

export function setWrittenCategories(content: OpenQuizContent, subject: string, categories: OpenQuizCategory[]): OpenQuizContent {
  return { ...content, classes: content.classes?.map(item => item.name === subject ? { ...item, categories } : item) }
}

/** Removing a folder never removes exams, questions or attempt IDs. */
export function removeWrittenCategory(content: OpenQuizContent, subject: string, id: string): OpenQuizContent {
  const definitions = groupWrittenDecks(content.decks.filter(deck => deck.subject === subject), content.classes?.find(item => item.name === subject)?.categories).categories
  return {
    ...setWrittenCategories(content, subject, definitions.filter(item => item.id !== id).map(({ id, name }) => ({ id, name }))),
    decks: content.decks.map(deck => deck.subject === subject && writtenCategoryId(deck) === id ? { ...deck, categoryId: null } : deck)
  }
}

/** Swap only the two indicated items. Other classes and groups retain their order. */
export function moveWrittenDeck(content: OpenQuizContent, deckId: string, direction: -1 | 1): OpenQuizContent {
  const deck = content.decks.find(item => item.id === deckId)
  if (!deck) return content
  const siblings = content.decks.filter(item => item.subject === deck.subject && writtenCategoryId(item) === writtenCategoryId(deck))
  const other = siblings[siblings.findIndex(item => item.id === deckId) + direction]
  if (!other) return content
  const decks = [...content.decks], from = decks.indexOf(deck), to = decks.indexOf(other)
  ;[decks[from], decks[to]] = [decks[to], decks[from]]
  return { ...content, decks }
}

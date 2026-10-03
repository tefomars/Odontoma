import type { OpenQuizDeck } from "./types"

const PARTIAL_NAMES: Record<string, number> = {
  primer: 1,
  primero: 1,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6
}

/** Older decks only encoded their partial in the title. New decks can set it explicitly. */
export function getOpenQuizPartial(deck: OpenQuizDeck): number | null {
  if (deck.partial === null) return null
  if (Number.isInteger(deck.partial) && (deck.partial ?? 0) >= 1 && (deck.partial ?? 0) <= 9) {
    return deck.partial as number
  }

  const title = deck.title.toLocaleLowerCase("es")
  const wordMatch = title.match(/\b(primer|primero|segundo|tercer|tercero|cuarto|quinto|sexto)\s+parcial\b/)
  if (wordMatch) return PARTIAL_NAMES[wordMatch[1]]

  const numberMatch = title.match(/\bparcial\s*([1-9])\b/)
  return numberMatch ? Number(numberMatch[1]) : null
}

export function groupOpenQuizDecks(decks: OpenQuizDeck[]) {
  const byPartial = new Map<number, OpenQuizDeck[]>()
  const ungrouped: OpenQuizDeck[] = []

  for (const deck of decks) {
    const partial = getOpenQuizPartial(deck)
    if (partial === null) {
      ungrouped.push(deck)
    } else {
      byPartial.set(partial, [...(byPartial.get(partial) || []), deck])
    }
  }

  return {
    partials: [...byPartial.entries()]
      .sort(([left], [right]) => left - right)
      .map(([number, items]) => ({ number, decks: items })),
    ungrouped
  }
}

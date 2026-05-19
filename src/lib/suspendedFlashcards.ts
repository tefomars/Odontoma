const SUSPENDED_KEY =
  "odontoma_suspended_flashcards"

export function loadSuspendedFlashcardIds(): string[] {

  const raw =
    localStorage.getItem(SUSPENDED_KEY)

  if (!raw) return []

  try {
    const parsed =
      JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed.filter(item => typeof item === "string")
      : []
  } catch {
    return []
  }
}

export function saveSuspendedFlashcardIds(
  ids: string[]
) {

  localStorage.setItem(
    SUSPENDED_KEY,
    JSON.stringify(Array.from(new Set(ids)))
  )
}

export function isFlashcardSuspended(
  cardId: string
) {

  return loadSuspendedFlashcardIds().includes(cardId)
}

export function suspendFlashcard(
  cardId: string
) {

  saveSuspendedFlashcardIds([
    ...loadSuspendedFlashcardIds(),
    cardId
  ])
}

export function unsuspendFlashcard(
  cardId: string
) {

  saveSuspendedFlashcardIds(
    loadSuspendedFlashcardIds().filter(id => id !== cardId)
  )
}

export function getSuspendedFlashcards<T extends { id: string }>(
  cards: T[]
) {

  const suspendedIds =
    loadSuspendedFlashcardIds()

  return cards.filter(card =>
    suspendedIds.includes(card.id)
  )
}

export function filterActiveFlashcards<T extends { id: string }>(
  cards: T[]
) {

  const suspendedIds =
    loadSuspendedFlashcardIds()

  return cards.filter(card =>
    !suspendedIds.includes(card.id)
  )
}

import procesoEconomicoIFlashcards from "@/content/flashcards/proceso-economico-i/cards"

import {
  histologiaFlashcards,
  type Flashcard
} from "@/content/flashcards/histologia/cards"

import {
  getUserFlashcardsByTopic,
  loadUserFlashcards
} from "@/lib/userFlashcards"

export type FlashcardSource =
  | "default"
  | "user"

export function getDefaultFlashcards(): Flashcard[] {
  return [
    ...histologiaFlashcards,
    ...procesoEconomicoIFlashcards
  ]
}

export function getMyFlashcards() {
  return loadUserFlashcards()
}

export function getUserTopicFlashcards(
  topicId: string
): Flashcard[] {
  return getUserFlashcardsByTopic(topicId)
}

export function getFlashcardsBySource(
  source: FlashcardSource,
  topicId?: string
): Flashcard[] {

  if (source === "default") {
    return getDefaultFlashcards()
  }

  if (topicId) {
    return getUserTopicFlashcards(topicId)
  }

  return getMyFlashcards()
}

import { studioBanks } from "@/content/studio/catalog"

import {
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
  return studioBanks.filter(bank => bank.kind === "course" && !bank.archived).flatMap(bank => bank.flashcards)
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

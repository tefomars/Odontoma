import type {
  Flashcard
} from "@/content/flashcards/histologia/cards"

import {
  deleteFsrsCardHistory
} from "@/lib/flashcardStorage"

import {
  deleteSuspendedFlashcardHistory
} from "@/lib/suspendedFlashcards"

import {
  detectDelimiter,
  parseDelimitedRows,
  serializeDelimitedRows
} from "@/lib/delimitedText"

const TOPICS_KEY =
  "odontoma_user_flashcard_topics"

const CARDS_KEY =
  "odontoma_user_flashcards"

export type UserFlashcardTopic = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type UserFlashcardInput = {
  topicId: string
  front: string
  back: string
}

export function loadUserFlashcardTopics(): UserFlashcardTopic[] {

  const raw =
    localStorage.getItem(TOPICS_KEY)

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUserFlashcardTopics(
  topics: UserFlashcardTopic[]
) {

  localStorage.setItem(
    TOPICS_KEY,
    JSON.stringify(topics)
  )
}

export function createUserFlashcardTopic(params: {
  name: string
  description?: string
}) {

  const now =
    new Date().toISOString()

  const topic: UserFlashcardTopic = {
    id: `topic-${Date.now()}-${crypto.randomUUID()}`,
    name: params.name.trim(),
    description: params.description?.trim() || "",
    createdAt: now,
    updatedAt: now
  }

  const topics =
    loadUserFlashcardTopics()

  saveUserFlashcardTopics([
    ...topics,
    topic
  ])

  return topic
}

export function loadUserFlashcards(): Flashcard[] {

  const raw =
    localStorage.getItem(CARDS_KEY)

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUserFlashcards(
  cards: Flashcard[]
) {

  localStorage.setItem(
    CARDS_KEY,
    JSON.stringify(cards)
  )
}

export function getUserFlashcardsByTopic(
  topicId: string
) {

  return loadUserFlashcards().filter(
    card => card.topic === topicId
  )
}

export function addUserFlashcard(
  input: UserFlashcardInput
) {

  const cards =
    loadUserFlashcards()

  const topics =
    loadUserFlashcardTopics()

  const topic =
    topics.find(item => item.id === input.topicId)

  const card: Flashcard = {
    id: `user-card-${Date.now()}-${crypto.randomUUID()}`,
    subject: "My flashcards",
    book: "Personal",
    chapter: topic?.name || "My flashcards",
    topic: input.topicId,
    subtopic: "General",
    front: input.front.trim(),
    back: input.back.trim(),
    tags: ["user"]
  }

  saveUserFlashcards([
    ...cards,
    card
  ])

  saveUserFlashcardTopics(
    topics.map(item =>
      item.id === input.topicId
        ? {
            ...item,
            updatedAt: new Date().toISOString()
          }
        : item
    )
  )

  return card
}

export function updateUserFlashcard(params: {
  cardId: string
  front: string
  back: string
}) {

  const cards =
    loadUserFlashcards()

  const nextCards =
    cards.map(card =>
      card.id === params.cardId
        ? {
            ...card,
            front: params.front.trim(),
            back: params.back.trim()
          }
        : card
    )

  saveUserFlashcards(nextCards)

  return nextCards.find(card => card.id === params.cardId)
}

export function deleteUserFlashcard(
  cardId: string
) {

  const cards =
    loadUserFlashcards()

  saveUserFlashcards(
    cards.filter(card => card.id !== cardId)
  )

  deleteFsrsCardHistory([cardId])
  deleteSuspendedFlashcardHistory([cardId])
}


export function deleteUserFlashcardTopic(
  topicId: string
) {

  const topics =
    loadUserFlashcardTopics()

  saveUserFlashcardTopics(
    topics.filter(topic => topic.id !== topicId)
  )

  const cards =
    loadUserFlashcards()

  const deletedCardIds =
    cards
      .filter(card => card.topic === topicId)
      .map(card => card.id)

  saveUserFlashcards(
    cards.filter(card => card.topic !== topicId)
  )

  deleteFsrsCardHistory(deletedCardIds)
  deleteSuspendedFlashcardHistory(deletedCardIds)
}

function isFlashcardHeader(
  front: string,
  back: string
) {

  const normalizedFront =
    front.trim().toLowerCase()

  const normalizedBack =
    back.trim().toLowerCase()

  return (
    ["front", "frente", "pregunta", "anverso"].includes(normalizedFront) &&
    ["back", "reverso", "respuesta"].includes(normalizedBack)
  )
}

export function importUserFlashcardsFromTabText(params: {
  topicId: string
  text: string
}) {

  const delimiter =
    detectDelimiter(params.text)

  const rows =
    parseDelimitedRows(
      params.text,
      delimiter
    )

  const topics =
    loadUserFlashcardTopics()

  const topic =
    topics.find(item => item.id === params.topicId)

  const importedCards: Flashcard[] = []

  for (const [index, row] of rows.entries()) {

    const [front, ...backParts] =
      row

    const back =
      backParts.join(delimiter)

    if (!front?.trim() || !back?.trim()) {
      continue
    }

    if (
      index === 0 &&
      isFlashcardHeader(front, back)
    ) {
      continue
    }

    importedCards.push({
      id: `user-card-${Date.now()}-${crypto.randomUUID()}`,
      subject: "My flashcards",
      book: "Personal",
      chapter: topic?.name || "My flashcards",
      topic: params.topicId,
      subtopic: "General",
      front: front.trim(),
      back: back.trim(),
      tags: ["user"]
    })
  }

  if (importedCards.length > 0) {
    saveUserFlashcards([
      ...loadUserFlashcards(),
      ...importedCards
    ])

    const updatedAt = new Date().toISOString()
    saveUserFlashcardTopics(
      topics.map(item =>
        item.id === params.topicId
          ? { ...item, updatedAt }
          : item
      )
    )
  }

  return importedCards
}

export function exportUserFlashcardsToTabText(
  topicId: string
) {

  return serializeDelimitedRows(
    getUserFlashcardsByTopic(topicId).map(card => [
      card.front,
      card.back
    ]),
    "\t"
  )
}

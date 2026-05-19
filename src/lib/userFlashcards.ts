import type {
  Flashcard
} from "@/content/flashcards/histologia/cards"

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

  saveUserFlashcards(
    cards.filter(card => card.topic !== topicId)
  )
}

export function importUserFlashcardsFromTabText(params: {
  topicId: string
  text: string
}) {

  const lines =
    params.text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)

  const importedCards = []

  for (const line of lines) {

    const [front, ...backParts] =
      line.split("\t")

    const back =
      backParts.join("\t")

    if (!front?.trim() || !back?.trim()) {
      continue
    }

    importedCards.push(
      addUserFlashcard({
        topicId: params.topicId,
        front,
        back
      })
    )
  }

  return importedCards
}

export function exportUserFlashcardsToTabText(
  topicId: string
) {

  return getUserFlashcardsByTopic(topicId)
    .map(card =>
      `${card.front.replace(/\r?\n/g, " ")}\t${card.back.replace(/\r?\n/g, " ")}`
    )
    .join("\n")
}

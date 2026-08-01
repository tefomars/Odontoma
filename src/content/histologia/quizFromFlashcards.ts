import type { Flashcard } from "@/content/flashcards/histologia/cards"

export type HistologiaQuizQuestion = {
  id: string
  chapter: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  type: "single"
  question: string
  options: string[]
  correctAnswers: number[]
  explanation: string
  tags: string[]
}

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim()
}

function stableHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function answerKind(answer: string) {
  const normalized = normalizeAnswer(answer)
  const wordCount = normalized.split(/\s+/).filter(Boolean).length

  if (["si", "no", "verdadero", "falso"].includes(normalized)) {
    return "binary"
  }

  if (/\d/.test(answer)) return "numeric"
  if (/[,;:]|\by\b|\bo\b/i.test(answer)) return "list"
  if (wordCount <= 6) return "term"

  return "sentence"
}

function binaryOptions(answer: string) {
  const normalized = normalizeAnswer(answer)

  if (normalized === "verdadero" || normalized === "falso") {
    return normalized === "verdadero"
      ? [answer, "Falso."]
      : [answer, "Verdadero."]
  }

  if (normalized === "si" || normalized === "no") {
    return normalized === "si"
      ? [answer, "No."]
      : [answer, "Sí."]
  }

  return null
}

function inferDifficulty(card: Flashcard): HistologiaQuizQuestion["difficulty"] {
  const answerWords = normalizeAnswer(card.back).split(/\s+/).filter(Boolean).length
  const hardPrompt = /compare|relacione|mecanismo|secuencia|explique|consecuencia|diferencia|por qué/i
    .test(card.front)

  if (hardPrompt || answerWords >= 15) return "hard"
  if (answerWords <= 5 && card.front.length <= 105) return "easy"

  return "medium"
}

export function createQuizQuestionsFromFlashcards(
  cards: Flashcard[]
): HistologiaQuizQuestion[] {
  const metadata = cards.map(card => ({
    card,
    normalizedAnswer: normalizeAnswer(card.back),
    kind: answerKind(card.back)
  }))

  const bySubtopic = new Map<string, typeof metadata>()
  const byTopic = new Map<string, typeof metadata>()

  for (const item of metadata) {
    const subtopicItems = bySubtopic.get(item.card.subtopic)
    const topicItems = byTopic.get(item.card.topic)

    if (subtopicItems) {
      subtopicItems.push(item)
    } else {
      bySubtopic.set(item.card.subtopic, [item])
    }

    if (topicItems) {
      topicItems.push(item)
    } else {
      byTopic.set(item.card.topic, [item])
    }
  }

  function buildDistractors(source: (typeof metadata)[number]) {
    const answers: string[] = []
    const used = new Set([source.normalizedAnswer])
    const pools = [
      bySubtopic.get(source.card.subtopic) || [],
      byTopic.get(source.card.topic) || [],
      metadata
    ]

    for (const pool of pools) {
      const candidates = pool
        .filter(candidate => candidate.card.id !== source.card.id)
        .filter(candidate => !used.has(candidate.normalizedAnswer))
        .map(candidate => ({
          ...candidate,
          score:
            (candidate.kind === source.kind ? 0 : 250) +
            Math.abs(candidate.card.back.length - source.card.back.length) +
            stableHash(`${source.card.id}:${candidate.card.id}`) / 0xffffffff
        }))
        .sort((first, second) => first.score - second.score)

      for (const candidate of candidates) {
        if (used.has(candidate.normalizedAnswer)) continue

        answers.push(candidate.card.back.trim())
        used.add(candidate.normalizedAnswer)

        if (answers.length === 3) return answers
      }
    }

    return answers
  }

  return metadata.map(source => {
    const { card } = source
    const correctAnswer = card.back.trim()
    const binary = binaryOptions(correctAnswer)
    const options = binary || [
      correctAnswer,
      ...buildDistractors(source)
    ]

    return {
      id: `quiz-${card.id}`,
      chapter: card.chapter,
      topic: card.subtopic,
      difficulty: inferDifficulty(card),
      type: "single",
      question: card.front.trim(),
      options,
      correctAnswers: [0],
      explanation: `${correctAnswer} Tema: ${card.subtopic}.`,
      tags: [card.chapter, card.topic, card.subtopic, card.book]
    }
  })
}

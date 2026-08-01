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

function promptKind(prompt: string) {
  const normalized = normalizeAnswer(prompt)

  if (/por que/.test(normalized)) return "cause"
  if (/donde|en que sitio|en cual/.test(normalized)) return "location"
  if (/cuanto|cuantos|numero|porcentaje/.test(normalized)) return "quantity"
  if (/quien|que celula|que estructura|que molecula|que factor|que receptor/.test(normalized)) return "identity"
  if (/como|mediante que/.test(normalized)) return "mechanism"
  if (/cual|cuales/.test(normalized)) return "selection"

  return "fact"
}

function answerLead(answer: string) {
  const normalized = normalizeAnswer(answer)

  if (/^(por|porque|debido)/.test(normalized)) return "cause"
  if (/^(en|dentro|sobre|entre)/.test(normalized)) return "location"
  if (/^\d/.test(normalized)) return "quantity"
  if (/^(si|no|verdadero|falso)$/.test(normalized)) return "binary"
  if (/^(mediante|a traves|por medio)/.test(normalized)) return "mechanism"

  return "noun"
}

type EntityKind =
  | "factor"
  | "receptor"
  | "cell"
  | "vessel"
  | "layer"
  | "disease"
  | "interleukin"
  | "immunoglobulin"
  | "cd-marker"
  | "test"
  | "location"
  | "quantity"

function expectedEntity(prompt: string): EntityKind | null {
  const normalized = normalizeAnswer(prompt)

  if (/que (factor|factores)/.test(normalized)) return "factor"
  if (/que receptor|cual receptor/.test(normalized)) return "receptor"
  if (/que celula|que tipo celular|cual celula/.test(normalized)) return "cell"
  if (/que (vaso|arteria|vena|venula|capilar)/.test(normalized)) return "vessel"
  if (/que (tunica|capa)/.test(normalized)) return "layer"
  if (/que (enfermedad|sindrome)|cual enfermedad/.test(normalized)) return "disease"
  if (/que interleucina|cual interleucina|que citocina/.test(normalized)) return "interleukin"
  if (/que inmunoglobulina|cual inmunoglobulina/.test(normalized)) return "immunoglobulin"
  if (/que (cd|marcador cd)|cual (cd|marcador cd)/.test(normalized)) return "cd-marker"
  if (/que prueba|cual prueba|que tiempo de/.test(normalized)) return "test"
  if (/donde|en que sitio|en cual/.test(normalized)) return "location"
  if (/cuanto|cuantos|numero|porcentaje/.test(normalized)) return "quantity"

  return null
}

function answerEntity(answer: string): EntityKind | null {
  const normalized = normalizeAnswer(answer)

  if (/^(factor|factores)\b/.test(normalized)) return "factor"
  if (/\b(receptor|receptores|gpib|gpiib|gpiiib|par)\b/.test(normalized)) return "receptor"
  if (/\b(celula|celulas|linfocito|linfocitos|macrofago|macrofagos|neutrofilo|neutrofilos|monocito|monocitos|plaqueta|plaquetas|eritrocito|eritrocitos)\b/.test(normalized)) return "cell"
  if (/\b(arteria|arterias|arteriola|arteriolas|vena|venas|venula|venulas|capilar|capilares|vaso|vasos)\b/.test(normalized)) return "vessel"
  if (/\b(tunica|intima|media|adventicia|endocardio|miocardio|epicardio)\b/.test(normalized)) return "layer"
  if (/\b(enfermedad|sindrome|ateroesclerosis|hipertension|coronariopatia|linfadenitis|sida)\b/.test(normalized)) return "disease"
  if (/\b(il ?\d+|interleucina|interleucinas|tnf|interferon)\b/.test(normalized)) return "interleukin"
  if (/\b(iga|igd|ige|igg|igm|inmunoglobulina|inmunoglobulinas)\b/.test(normalized)) return "immunoglobulin"
  if (/\bcd\d+\b/.test(normalized)) return "cd-marker"
  if (/\b(ptt|pt|inr|tiempo de protrombina|tiempo parcial de tromboplastina)\b/.test(normalized)) return "test"
  if (/^(en|dentro|sobre|entre)\b/.test(normalized)) return "location"
  if (/^\d/.test(normalized)) return "quantity"

  return null
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

function importanceScore(card: Flashcard) {
  const prompt = normalizeAnswer(card.front)
  const answerWords = normalizeAnswer(card.back).split(/\s+/).filter(Boolean).length
  let score = 0

  if (/principal|caracteristic|funcion|diferencia|mecanismo|clasific|identific|relacion/.test(prompt)) {
    score += 10
  }

  if (/enfermedad|sindrome|deficiencia|clinica|diagnost/.test(prompt)) {
    score += 8
  }

  if (/donde|que celula|que estructura|que molecula|que factor|que receptor/.test(prompt)) {
    score += 6
  }

  if (answerWords >= 2 && answerWords <= 14) score += 5
  if (answerWords >= 24) score -= 8
  if (answerKind(card.back) === "binary") score -= 12
  if (/segun el texto|segun la figura/.test(prompt)) score -= 3

  return score
}

function subtopicQuota(size: number) {
  if (size >= 30) return 6
  if (size >= 20) return 5
  if (size >= 12) return 4
  if (size >= 7) return 3
  if (size >= 4) return 2

  return 1
}

export function selectImportantFlashcards(cards: Flashcard[]) {
  const bySubtopic = new Map<string, Flashcard[]>()

  for (const card of cards) {
    const group = bySubtopic.get(card.subtopic)

    if (group) {
      group.push(card)
    } else {
      bySubtopic.set(card.subtopic, [card])
    }
  }

  return Array.from(bySubtopic.values()).flatMap(group =>
    [...group]
      .sort((first, second) =>
        importanceScore(second) - importanceScore(first) ||
        stableHash(first.id) - stableHash(second.id)
      )
      .slice(0, subtopicQuota(group.length))
  )
}

export function createQuizQuestionsFromFlashcards(
  cards: Flashcard[]
): HistologiaQuizQuestion[] {
  const metadata = cards.map(card => ({
    card,
    normalizedAnswer: normalizeAnswer(card.back),
    kind: answerKind(card.back),
    promptKind: promptKind(card.front),
    answerLead: answerLead(card.back),
    expectedEntity: expectedEntity(card.front),
    answerEntity: answerEntity(card.back)
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
    const subtopicPool = bySubtopic.get(source.card.subtopic) || []
    const topicPool = byTopic.get(source.card.topic) || []
    const matchingEntity = (pool: typeof metadata) =>
      source.expectedEntity
        ? pool.filter(candidate =>
            candidate.answerEntity === source.expectedEntity
          )
        : pool
    const pools = source.expectedEntity
      ? [
          matchingEntity(subtopicPool),
          matchingEntity(topicPool),
          matchingEntity(metadata),
          subtopicPool,
          topicPool,
          metadata
        ]
      : [subtopicPool, topicPool, metadata]

    for (const pool of pools) {
      const candidates = pool
        .filter(candidate => candidate.card.id !== source.card.id)
        .filter(candidate => !used.has(candidate.normalizedAnswer))
        .map(candidate => ({
          ...candidate,
          score:
            (candidate.promptKind === source.promptKind ? 0 : 500) +
            (candidate.kind === source.kind ? 0 : 400) +
            (candidate.answerLead === source.answerLead ? 0 : 220) +
            (source.expectedEntity && candidate.answerEntity !== source.expectedEntity ? 1_500 : 0) +
            Math.abs(candidate.card.back.length - source.card.back.length) * 2 +
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

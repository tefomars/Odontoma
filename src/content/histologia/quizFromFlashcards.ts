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

export function quizPromptKind(prompt: string) {
  const normalized = normalizeAnswer(prompt)

  if (/que (dos|tres|cuatro)|cuales son (los|las) (dos|tres|cuatro)/.test(normalized)) return "enumeration"
  if (/que (cambio|cambios)|como cambia|que modificacion/.test(normalized)) return "change"
  if (/que (efecto|efectos)|que consecuencia|que resultado/.test(normalized)) return "effect"
  if (/que (funcion|funciones)|para que sirve|que papel/.test(normalized)) return "function"
  if (/que contiene|que componentes|que elementos|que estructuras forman|que forma parte/.test(normalized)) return "composition"
  if (/que es |que son |como se define|que significa|que nombre recibe/.test(normalized)) return "definition"
  if (/por que/.test(normalized)) return "cause"
  if (/^donde|en que (sitio|lugar|region|zona|territorio|capa|organo|compartimento|parte|fase|estado)/.test(normalized)) return "location"
  if (/cuanto|cuantos|numero|porcentaje/.test(normalized)) return "quantity"
  if (/quien|que celula|que estructura|que molecula|que factor|que receptor/.test(normalized)) return "identity"
  if (/como|mediante que/.test(normalized)) return "mechanism"
  if (/cual|cuales/.test(normalized)) return "selection"

  return "fact"
}

export function quizAnswerLead(answer: string) {
  const normalized = normalizeAnswer(answer)

  if (/\b(vegf|pdgf|tgf|fgf|egf|igf|ngf|hgf|cd\d+|il ?\d+)\b/.test(normalized)) {
    return "noun"
  }

  if (/\d/.test(normalized)) return "quantity"
  if (/^(por|porque|debido)/.test(normalized)) return "cause"
  if (/^(en|dentro|sobre|entre|alrededor|cerca|junto)/.test(normalized)) return "location"
  if (/^(de|del|desde)/.test(normalized)) return "relation"
  if (/^(si|no|verdadero|falso)$/.test(normalized)) return "binary"
  if (/^(mediante|a traves|por medio)/.test(normalized)) return "mechanism"
  if (/^(activa|inhibe|regula|secreta|produce|permite|favorece|forma|detecta|sintetiza|degrada|convierte|transporta|recluta|aisla|une|libera|estimula|mantiene|impide|aumenta|disminuye|relaja|contrae)\b/.test(normalized)) {
    return "action"
  }

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
  | "fiber"
  | "organ"
  | "protein"
  | "enzyme"
  | "hormone"
  | "mediator"
  | "structure"
  | "growth-factor"

export function expectedQuizEntity(prompt: string): EntityKind | null {
  const normalized = normalizeAnswer(prompt)

  if (/que (factor|factores) de crecimiento/.test(normalized)) return "growth-factor"
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
  if (/que (fibra|fibras)|cual (fibra|fibras)/.test(normalized)) return "fiber"
  if (/que organo|cual organo/.test(normalized)) return "organ"
  if (/que proteina|cual proteina/.test(normalized)) return "protein"
  if (/que enzima|cual enzima/.test(normalized)) return "enzyme"
  if (/que hormona|cual hormona/.test(normalized)) return "hormone"
  if (/que mediador|cual mediador/.test(normalized)) return "mediator"
  if (/que estructura|cual estructura/.test(normalized)) return "structure"
  if (/^donde|en que (sitio|lugar|region|zona|territorio|capa|organo|compartimento|parte|fase|estado)/.test(normalized)) return "location"
  if (/cuanto|cuantos|numero|porcentaje/.test(normalized)) return "quantity"

  return null
}

export function quizAnswerEntity(answer: string): EntityKind | null {
  const normalized = normalizeAnswer(answer)

  if (/\b(vegf|pdgf|tgf|tgf beta|fgf|egf|igf|ngf|hgf)\b/.test(normalized)) return "growth-factor"
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
  if (/\b(fibra|fibras|colageno|colagenas|elastica|elasticas)\b/.test(normalized)) return "fiber"
  if (/\b(corazon|timo|bazo|ganglio|ganglios|medula osea|amigdala|amigdalas)\b/.test(normalized)) return "organ"
  if (/\b(proteina|proteinas|fibrinogeno|fibronectina|trombomodulina|albumina|vimentina|perforina|granzima|granzimas|granulizina|fas ligando)\b/.test(normalized)) return "protein"
  if (/\b(enzima|enzimas|cinasa|fosfatasa|convertasa|ciclooxigenasa|plasmina|trombina)\b/.test(normalized)) return "enzyme"
  if (/\b(hormona|hormonas|epinefrina|adrenalina)\b/.test(normalized)) return "hormone"
  if (/\b(mediador|mediadores|histamina|serotonina|endotelina|prostaciclina|tromboxano|oxido nitrico)\b/.test(normalized)) return "mediator"
  if (/\d/.test(normalized)) return "quantity"
  if (/^(en|dentro|sobre|entre|alrededor|cerca|junto)\b/.test(normalized)) return "location"

  return null
}

export function quizAnswerKind(answer: string) {
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

const CUSTOM_DISTRACTORS: Record<string, string[]> = {
  "histo-cap13-capilares-0334": [
    "La presión capilar aplana su membrana.",
    "Los pericitos los comprimen durante el paso.",
    "La membrana basal forma tabiques dentro de la luz."
  ],
  "histo-cap13-vasos-sanguineos-atipicos-0370": [
    "Adelgazamiento progresivo de la túnica media.",
    "Desaparición de la lámina elástica interna.",
    "Dilatación uniforme sin cambios en la pared."
  ],
  "histo-cap13-oxido-nitrico-0294": [
    "El PDGF.",
    "El FGF.",
    "El TGF-β."
  ],
  "histo-cap14-linfocitos-th17-0069": [
    "Síndrome de DiGeorge.",
    "Síndrome de Wiskott-Aldrich.",
    "Síndrome de Chediak-Higashi."
  ],
  "histo-cap14-citotoxicidad-t-0182": [
    "La granzima B.",
    "La granulizina.",
    "La proteína Fas ligando."
  ],
  "histo-cap14-linfadenitis-reactiva-0297": [
    "Sustitución neoplásica del ganglio por una población monoclonal.",
    "Atrofia no inflamatoria de la corteza ganglionar.",
    "Depósito de calcio sin respuesta celular asociada."
  ],
  "histo-cap14-linfadenitis-reactiva-0298": [
    "Fibrosis capsular con desaparición de los senos.",
    "Atrofia cortical con pérdida de linfocitos.",
    "Calcificación de los nódulos con obliteración vascular."
  ],
  "histo-cap14-marcadores-cd-0434": [
    "CD19.",
    "CD20.",
    "CD3."
  ],
  "histo-cap14-vih-y-sida-0454": [
    "Por pérdida selectiva de linfocitos B con conservación de linfocitos T.",
    "Por aumento persistente de linfocitos TH17 y neutrófilos.",
    "Por expansión de células NK con hiperactividad inmunitaria."
  ],
  "histo-art-hemostasia-0073": [
    "VEGF y FGF.",
    "EGF e IGF-1.",
    "NGF y HGF."
  ]
}

export function hasCustomQuizDistractors(cardId: string) {
  return Boolean(CUSTOM_DISTRACTORS[cardId])
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
  if (quizAnswerKind(card.back) === "binary") score -= 12
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
  cards: Flashcard[],
  distractorCards: Flashcard[] = cards
): HistologiaQuizQuestion[] {
  const metadata = distractorCards.map(card => ({
    card,
    normalizedAnswer: normalizeAnswer(card.back),
    kind: quizAnswerKind(card.back),
    promptKind: quizPromptKind(card.front),
    answerLead: quizAnswerLead(card.back),
    expectedEntity: expectedQuizEntity(card.front),
    answerEntity: quizAnswerEntity(card.back)
  }))
  const metadataById = new Map(
    metadata.map(item => [item.card.id, item])
  )

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
    const targetEntity =
      (
        source.expectedEntity === "location" ||
        source.expectedEntity === "structure"
      ) && source.answerEntity &&
      source.answerEntity !== source.expectedEntity
        ? source.answerEntity
        : source.expectedEntity
    const subtopicPool = bySubtopic.get(source.card.subtopic) || []
    const topicPool = byTopic.get(source.card.topic) || []
    const matchingEntity = (pool: typeof metadata) =>
      targetEntity
        ? pool.filter(candidate =>
            candidate.expectedEntity === targetEntity ||
            candidate.answerEntity === targetEntity
          )
        : pool
    const matchingEntityAndLead = (pool: typeof metadata) =>
      matchingEntity(pool).filter(candidate =>
        candidate.answerLead === source.answerLead
      )
    const matchingKindAndLead = (pool: typeof metadata) =>
      pool.filter(candidate =>
        candidate.kind === source.kind &&
        candidate.answerLead === source.answerLead
      )
    const matchingKind = (pool: typeof metadata) =>
      pool.filter(candidate => candidate.kind === source.kind)
    const matchingPromptAndKind = (pool: typeof metadata) =>
      pool.filter(candidate =>
        candidate.promptKind === source.promptKind &&
        candidate.kind === source.kind
      )
    const matchingPromptKindAndLead = (pool: typeof metadata) =>
      pool.filter(candidate =>
        candidate.promptKind === source.promptKind &&
        candidate.kind === source.kind &&
        candidate.answerLead === source.answerLead
      )
    const pools = source.expectedEntity
      ? [
          matchingEntityAndLead(subtopicPool),
          matchingEntityAndLead(topicPool),
          matchingEntityAndLead(metadata)
        ]
      : source.promptKind !== "fact"
        ? [
            matchingPromptKindAndLead(subtopicPool),
            matchingKindAndLead(subtopicPool),
            matchingPromptKindAndLead(topicPool),
            matchingPromptKindAndLead(metadata),
            matchingPromptAndKind(topicPool),
            matchingPromptAndKind(metadata)
          ]
        : [
            matchingKindAndLead(subtopicPool),
            matchingKindAndLead(topicPool),
            matchingKindAndLead(metadata),
            matchingKind(subtopicPool),
            matchingKind(topicPool),
            matchingKind(metadata)
          ]

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
            (
              targetEntity &&
              candidate.expectedEntity !== targetEntity &&
              candidate.answerEntity !== targetEntity
                ? 1_500
                : 0
            ) +
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

  return cards.map(card => {
    const source = metadataById.get(card.id)

    if (!source) {
      throw new Error(`Missing distractor metadata for ${card.id}`)
    }

    const correctAnswer = card.back.trim()
    const binary = binaryOptions(correctAnswer)
    const customDistractors = CUSTOM_DISTRACTORS[card.id]
    const options = binary || [
      correctAnswer,
      ...(customDistractors || buildDistractors(source))
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

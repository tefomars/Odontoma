import { describe, expect, it } from "vitest"

import { cap13Flashcards } from "@/content/flashcards/histologia/cap13"
import { cap14Flashcards } from "@/content/flashcards/histologia/cap14"
import { articuloHemostasiaFlashcards } from "@/content/flashcards/histologia/articuloHemostasia"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"
import {
  expectedQuizEntity,
  hasCustomQuizDistractors,
  quizAnswerEntity,
  quizAnswerKind,
  quizAnswerLead,
  quizPromptKind
} from "./quizFromFlashcards"

const banks = [
  {
    chapter: "Capítulo 13",
    cards: cap13Flashcards,
    questions: cap13Questions
  },
  {
    chapter: "Capítulo 14",
    cards: cap14Flashcards,
    questions: cap14Questions
  },
  {
    chapter: "Artículo · Hemostasia y trombosis",
    cards: articuloHemostasiaFlashcards,
    questions: hemostasiaQuestions
  }
]

describe("quizzes de Citohistología II y artículos", () => {
  it("crea bancos selectivos sin perder ningún apartado", () => {
    for (const bank of banks) {
      const sourceSubtopics = new Set(
        bank.cards.map(card => card.subtopic)
      )
      const quizSubtopics = new Set(
        bank.questions.map(question => question.topic)
      )

      expect(bank.questions.length).toBeLessThan(bank.cards.length)
      expect(bank.questions.length).toBeGreaterThan(40)
      expect(quizSubtopics).toEqual(sourceSubtopics)
    }
  })

  it("mantiene capítulos, respuestas y explicaciones apoyadas en las tarjetas fuente", () => {
    for (const bank of banks) {
      const sourcesById = new Map(
        bank.cards.map(card => [`quiz-${card.id}`, card])
      )

      bank.questions.forEach(question => {
        const source = sourcesById.get(question.id)

        expect(source).toBeDefined()
        expect(question.chapter).toBe(bank.chapter)
        expect(question.question).toBe(source?.front.trim())
        expect(question.options[question.correctAnswers[0]]).toBe(source?.back.trim())
        expect(question.explanation).toContain(source?.back.trim())
      })
    }
  })

  it("produce identificadores y opciones válidas sin duplicados", () => {
    const questions = banks.flatMap(bank => bank.questions)
    const ids = questions.map(question => question.id)
    const invalidOptionCounts = questions
      .filter(question =>
        question.options.length < 2 || question.options.length > 4
      )
      .map(question => `${question.id}: ${question.options.length}`)

    expect(new Set(ids).size).toBe(ids.length)
    expect(invalidOptionCounts).toEqual([])

    for (const question of questions) {
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(question.correctAnswers).toEqual([0])
      expect(["easy", "medium", "hard"]).toContain(question.difficulty)
    }
  })

  it("conserva representación de todas las dificultades en cada banco", () => {
    for (const bank of banks) {
      const difficulties = new Set(
        bank.questions.map(question => question.difficulty)
      )

      expect(difficulties).toEqual(new Set(["easy", "medium", "hard"]))
    }
  })

  it("compara factores de coagulación contra otros factores", () => {
    const question = hemostasiaQuestions.find(item =>
      item.question === "¿Qué factor de coagulación puede activar plasminógeno?"
    )

    expect(question).toBeDefined()
    expect(question?.options).toHaveLength(4)

    for (const option of question?.options || []) {
      expect(option.toLocaleLowerCase("es")).toMatch(/factor/)
    }
  })

  it("compara fibras valvulares contra otras fibras", () => {
    const question = cap13Questions.find(item =>
      item.question === "¿Qué fibras acompañan a los proteoglucanos en la esponjosa?"
    )

    expect(question).toBeDefined()
    expect(question?.options).toHaveLength(4)

    for (const option of question?.options || []) {
      expect(option.toLocaleLowerCase("es")).toMatch(
        /fibra|colágen|elástic|reticular/
      )
    }
  })

  it("mantiene la misma categoría semántica en todas las preguntas tipables", () => {
    const issues: string[] = []

    for (const bank of banks) {
      const sourcesByAnswer = new Map<string, typeof bank.cards>()

      for (const card of bank.cards) {
        const key = card.back.trim().toLocaleLowerCase("es")
        const sources = sourcesByAnswer.get(key)

        if (sources) {
          sources.push(card)
        } else {
          sourcesByAnswer.set(key, [card])
        }
      }

      for (const question of bank.questions) {
        const expected = expectedQuizEntity(question.question)

        if (!expected) continue

        const correctOption =
          question.options[question.correctAnswers[0]]
        const correctEntity = quizAnswerEntity(correctOption)
        const targetEntity =
          (expected === "location" || expected === "structure") &&
          correctEntity && correctEntity !== expected
            ? correctEntity
            : expected

        for (const option of question.options) {
          const sources =
            sourcesByAnswer.get(option.trim().toLocaleLowerCase("es")) || []
          const compatible =
            quizAnswerEntity(option) === targetEntity ||
            sources.some(source =>
              expectedQuizEntity(source.front) === targetEntity
            )

          if (!compatible) {
            issues.push(
              `${question.id} espera ${targetEntity}: ${option}`
            )
          }
        }
      }
    }

    expect(issues).toEqual([])
  })

  it("mantiene el mismo formato de respuesta en las demás preguntas", () => {
    const issues: string[] = []

    for (const bank of banks) {
      for (const question of bank.questions) {
        if (expectedQuizEntity(question.question)) continue
        if (quizPromptKind(question.question) !== "fact") continue

        const correctKind = quizAnswerKind(
          question.options[question.correctAnswers[0]]
        )

        if (correctKind === "binary") continue

        for (const option of question.options) {
          if (quizAnswerKind(option) !== correctKind) {
            issues.push(
              `${question.id} mezcla ${correctKind} con ${quizAnswerKind(option)}: ${option}`
            )
          }
        }
      }
    }

    expect(issues).toEqual([])
  })

  it("mantiene construcciones gramaticales equivalentes en preguntas tipables", () => {
    const issues: string[] = []

    for (const bank of banks) {
      for (const question of bank.questions) {
        if (!expectedQuizEntity(question.question)) continue

        const correctLead = quizAnswerLead(
          question.options[question.correctAnswers[0]]
        )

        for (const option of question.options) {
          if (quizAnswerLead(option) !== correctLead) {
            issues.push(
              `${question.id} mezcla ${correctLead} con ${quizAnswerLead(option)}: ${option}`
            )
          }
        }
      }
    }

    expect(issues).toEqual([])
  })

  it("compara intenciones equivalentes en preguntas de función, cambio, efecto y definición", () => {
    const issues: string[] = []

    for (const bank of banks) {
      const sourcesByAnswer = new Map<string, typeof bank.cards>()

      for (const card of bank.cards) {
        const key = card.back.trim().toLocaleLowerCase("es")
        const sources = sourcesByAnswer.get(key)

        if (sources) {
          sources.push(card)
        } else {
          sourcesByAnswer.set(key, [card])
        }
      }

      for (const question of bank.questions) {
        if (expectedQuizEntity(question.question)) continue

        const promptKind = quizPromptKind(question.question)
        const cardId = question.id.replace(/^quiz-/, "")
        const questionSource = bank.cards.find(card => card.id === cardId)
        const correctLead = quizAnswerLead(
          question.options[question.correctAnswers[0]]
        )

        if (promptKind === "fact" || hasCustomQuizDistractors(cardId)) {
          continue
        }

        for (const option of question.options) {
          const sources =
            sourcesByAnswer.get(option.trim().toLocaleLowerCase("es")) || []

          if (!sources.some(source =>
            quizPromptKind(source.front) === promptKind ||
            (
              source.subtopic === questionSource?.subtopic &&
              quizAnswerLead(source.back) === correctLead
            )
          )) {
            issues.push(
              `${question.id} espera ${promptKind}: ${option}`
            )
          }
        }
      }
    }

    expect(issues).toEqual([])
  })
})

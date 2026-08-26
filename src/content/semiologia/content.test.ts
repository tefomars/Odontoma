import { describe, expect, it } from "vitest"
import { semiologiaFlashcards } from "@/content/flashcards/semiologia/cards"
import { semiologiaQuestions } from "./questions"
import { semiologiaOpenQuizDecks } from "@/content/openQuizzes/semiologia"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"

describe("contenido de Semiología", () => {
  it("cubre los cuatro bloques en las tres modalidades", () => {
    const blocks = ["Bloque 1", "Bloque 2", "Bloque 3", "Bloque 4"]

    for (const block of blocks) {
      expect(semiologiaFlashcards.some(card => card.chapter === block)).toBe(true)
      expect(semiologiaQuestions.some(question => question.chapter === block)).toBe(true)
    }

    expect(semiologiaOpenQuizDecks).toHaveLength(4)
  })

  it("mantiene identificadores únicos y respuestas válidas", () => {
    const flashcardIds = semiologiaFlashcards.map(card => card.id)
    const questionIds = semiologiaQuestions.map(question => question.id)
    const openQuestionIds = semiologiaOpenQuizDecks.flatMap(deck =>
      deck.questions.map(question => question.id)
    )

    expect(new Set(flashcardIds).size).toBe(flashcardIds.length)
    expect(new Set(questionIds).size).toBe(questionIds.length)
    expect(new Set(openQuestionIds).size).toBe(openQuestionIds.length)

    for (const question of semiologiaQuestions) {
      expect(question.options).toHaveLength(4)
      expect(question.type).toBe("single")
      expect(question.correctAnswers).toHaveLength(1)
      expect(question.correctAnswers[0]).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswers[0]).toBeLessThan(question.options.length)
      expect(question.explanation.length).toBeGreaterThan(10)
    }
  })

  it("puede aleatorizar e iniciar una sesión de opción múltiple", () => {
    const session = shuffleQuestionsBalanced(semiologiaQuestions.slice(0, 10))

    expect(session).toHaveLength(10)
    for (const question of session) {
      expect(question.correctAnswers).toHaveLength(1)
      expect(question.options[question.correctAnswers[0]]).toBeTruthy()
    }
  })

  it("presenta el contenido sin referencias editoriales a los apuntes", () => {
    const visibleContent = JSON.stringify({
      flashcards: semiologiaFlashcards,
      multipleChoice: semiologiaQuestions,
      openEnded: semiologiaOpenQuizDecks
    })

    expect(visibleContent).not.toMatch(/según|apuntes|anotad[oa]s?/i)
  })

  it("incluye suficiente práctica para el documento completo", () => {
    expect(semiologiaFlashcards.length).toBeGreaterThanOrEqual(220)
    expect(semiologiaQuestions.length).toBeGreaterThanOrEqual(120)
    expect(
      semiologiaOpenQuizDecks.reduce(
        (total, deck) => total + deck.questions.length,
        0
      )
    ).toBeGreaterThanOrEqual(80)
  })
})

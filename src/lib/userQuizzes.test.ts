import { beforeEach, describe, expect, it } from "vitest"

import {
  addUserQuizQuestion,
  createUserQuizDeck,
  importUserQuizQuestionsFromTabText
} from "@/lib/userQuizzes"

import {
  installLocalStorageMock
} from "@/test/localStorageMock"

describe("user quizzes", () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it("recalcula la respuesta correcta al eliminar una opción vacía", () => {
    const deck = createUserQuizDeck({ name: "Prueba" })
    const question = addUserQuizQuestion({
      deckId: deck.id,
      question: "¿Cuál?",
      options: ["A", "", "C"],
      correctAnswers: [2]
    })

    expect(question.options).toEqual(["A", "C"])
    expect(question.correctAnswers).toEqual([1])
  })

  it("importa TSV entrecomillado y guarda el lote completo", () => {
    const deck = createUserQuizDeck({ name: "Importación" })
    const imported = importUserQuizQuestionsFromTabText({
      deckId: deck.id,
      text: '"Pregunta\nen dos líneas"\tA\tB\t\t\t2\t"Explicación\tútil"'
    })

    expect(imported).toHaveLength(1)
    expect(imported[0]).toMatchObject({
      question: "Pregunta\nen dos líneas",
      options: ["A", "B"],
      correctAnswers: [1],
      explanation: "Explicación\tútil"
    })
  })
})

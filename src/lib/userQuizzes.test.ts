import { beforeEach, describe, expect, it } from "vitest"

import {
  addUserOpenQuizQuestion,
  addUserQuizQuestion,
  createUserQuizDeck,
  exportUserQuizBundle,
  getUserQuizDeckMode,
  getUserQuizQuestionsByDeck,
  importUserQuizBundle,
  importUserOpenQuizQuestionsFromTabText,
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

  it("comparte e importa un quiz escrito sin incluir progreso", () => {
    const deck = createUserQuizDeck({
      name: "Escrito",
      mode: "open-ended"
    })

    addUserOpenQuizQuestion({
      deckId: deck.id,
      question: "Explica la coagulación",
      modelAnswer: "Respuesta modelo",
      acceptedPoints: ["Factor XII"]
    })

    const bundle = exportUserQuizBundle(deck.id)
    const imported = importUserQuizBundle(JSON.stringify(bundle))

    expect(getUserQuizDeckMode(imported.deck)).toBe("open-ended")
    expect(imported.deck.id).not.toBe(deck.id)
    expect(getUserQuizQuestionsByDeck(imported.deck.id)[0]).toMatchObject({
      question: "Explica la coagulación",
      modelAnswer: "Respuesta modelo",
      acceptedPoints: ["Factor XII"]
    })
    expect(JSON.stringify(bundle)).not.toContain("score")
    expect(JSON.stringify(bundle)).not.toContain("history")
  })

  it("importa preguntas escritas desde TSV y separa los puntos aceptados", () => {
    const deck = createUserQuizDeck({
      name: "Escrito importado",
      mode: "open-ended"
    })

    const imported = importUserOpenQuizQuestionsFromTabText({
      deckId: deck.id,
      text: "Explica la hemostasia\tRespuesta modelo\tPlaquetas | Fibrina\tExplicación adicional"
    })

    expect(imported).toHaveLength(1)
    expect(imported[0]).toMatchObject({
      question: "Explica la hemostasia",
      modelAnswer: "Respuesta modelo",
      acceptedPoints: ["Plaquetas", "Fibrina"],
      explanation: "Explicación adicional"
    })
  })

  it("importa un quiz de opción múltiple como una copia", () => {
    const deck = createUserQuizDeck({ name: "Compartido" })
    addUserQuizQuestion({
      deckId: deck.id,
      question: "¿Cuál?",
      options: ["A", "B"],
      correctAnswers: [1]
    })

    const imported = importUserQuizBundle(
      JSON.stringify(exportUserQuizBundle(deck.id))
    )

    expect(imported.deck.id).not.toBe(deck.id)
    expect(imported.questions[0]).toMatchObject({
      options: ["A", "B"],
      correctAnswers: [1]
    })
  })
})

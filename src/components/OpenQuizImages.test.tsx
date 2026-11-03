import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import type { OpenQuizDeck } from "@/content/openQuizzes"
import { saveOpenQuizProgress } from "@/lib/openQuizProgress"
import { loadQuizHistory, saveQuizAttempt, type QuizAttempt } from "@/lib/quizHistory"
import OpenQuizSessionScreen from "./OpenQuizSessionScreen"
import QuizReviewScreen from "./QuizReviewScreen"

const questionImage = "/media/question-test.png"
const answerImage = "/media/answer-test.png"
const deck: OpenQuizDeck = {
  id: "image-deck", title: "Imágenes", subject: "Prueba",
  questions: [{
    id: "image-question", prompt: "¿Qué estructura es?", modelAnswer: "Respuesta modelo", acceptedPoints: [],
    image: questionImage, imageAlt: "Imagen de identificación",
    backImage: answerImage, backImageAlt: "Esquema de la solución"
  }]
}
const renderSession = () => renderToStaticMarkup(<OpenQuizSessionScreen deck={deck} initialQuestions={deck.questions} onBack={() => {}} onMainMenu={() => {}} />)

describe("imágenes separadas en exámenes escritos", () => {
  beforeEach(() => { installLocalStorageMock() })

  it("muestra la pregunta pero no carga ni expone la imagen de respuesta antes de revelar", () => {
    const html = renderSession()
    expect(html).toContain(questionImage)
    expect(html).not.toContain(answerImage)
    expect(html).not.toContain("Esquema de la solución")
    expect(html).not.toContain("Respuesta modelo")
  })

  it("haber escrito una respuesta no revela por sí solo la imagen", () => {
    saveOpenQuizProgress({ deckId: deck.id, questionIds: ["image-question"], current: 0,
      answers: { "image-question": "Mi respuesta" }, revealedQuestionIds: [], gradesByQuestion: {}, savedAt: "2026-11-02T00:00:00Z" })
    expect(renderSession()).not.toContain(answerImage)
  })

  it("tras revelar y volver a la sesión conserva ambas imágenes en sus secciones", () => {
    saveOpenQuizProgress({ deckId: deck.id, questionIds: ["image-question"], current: 0,
      answers: { "image-question": "Mi respuesta" }, revealedQuestionIds: ["image-question"], gradesByQuestion: {}, savedAt: "2026-11-02T00:00:00Z" })
    const html = renderSession()
    expect(html).toContain(questionImage)
    expect(html).toContain(answerImage)
    expect(html).toContain('alt="Esquema de la solución"')
    expect(html.indexOf(answerImage)).toBeGreaterThan(html.indexOf("Respuesta modelo"))
  })

  it("historial y revisión conservan la imagen dentro de la respuesta modelo", () => {
    const attempt: QuizAttempt = { id: "attempt", title: deck.title, subject: deck.subject, mode: "open-ended",
      score: 0, total: 1, completedAt: "2026-11-02T00:00:00Z", responses: [{
        questionId: "image-question", question: deck.questions[0].prompt,
        selectedAnswers: ["Mi respuesta"], correctAnswers: ["Respuesta modelo"], grade: "incorrect", isCorrect: false,
        image: questionImage, imageAlt: "Imagen de identificación", backImage: answerImage, backImageAlt: "Esquema de la solución"
      }] }
    saveQuizAttempt(attempt)
    const restored = loadQuizHistory()[0]
    expect(restored.responses[0].backImage).toBe(answerImage)
    const html = renderToStaticMarkup(<QuizReviewScreen attempt={restored} onBack={() => {}} onMainMenu={() => {}} />)
    expect(html).toContain(questionImage)
    expect(html).toContain(answerImage)
    expect(html.indexOf(answerImage)).toBeGreaterThan(html.indexOf("Respuesta modelo"))
  })
})

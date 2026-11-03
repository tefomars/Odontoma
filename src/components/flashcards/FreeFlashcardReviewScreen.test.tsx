import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { resetFreeFlashcardProgress, saveFreeFlashcardResult } from "@/lib/freeFlashcardProgress"
import type { Flashcard } from "@/content/flashcards/histologia/cards"
import FreeFlashcardReviewScreen from "./FreeFlashcardReviewScreen"

const cards = [
  { id: "a", chapter: "Capítulo", topic: "Tema", subtopic: "Subtema", front: "Pregunta ya completada", back: "Respuesta" },
  { id: "b", chapter: "Capítulo", topic: "Tema", subtopic: "Subtema", front: "Pregunta pendiente", back: "Respuesta" }
] as Flashcard[]
const completed = { status: "completed", reviewedAt: "2026-11-02T00:00:00Z" } as const
const render = () => renderToStaticMarkup(<FreeFlashcardReviewScreen cards={cards} onBack={() => {}} />)

describe("pantalla Sin espera con memoria", () => {
  beforeEach(() => { installLocalStorageMock() })
  it("al reabrir muestra solo pendientes y ofrece reinicio con contador", () => {
    saveFreeFlashcardResult("a", completed)
    const html = render()
    expect(html).not.toContain("Pregunta ya completada")
    expect(html).toContain("Pregunta pendiente")
    expect(html).toContain("1 de 2 completadas")
    expect(html).toContain("Reiniciar este bloque")
  })
  it("un bloque terminado muestra reinicio, no repite automáticamente", () => {
    for (const card of cards) saveFreeFlashcardResult(card.id, completed)
    const html = render()
    expect(html).toContain("Bloque completado")
    expect(html).not.toContain("Mostrar respuesta")
    expect(html).not.toContain("Continuar con pendientes")
    resetFreeFlashcardProgress(["b"])
    expect(render()).toContain("Pregunta pendiente")
  })
  it("sigue excluyendo suspendidas, sin borrarlas al reiniciar memoria", () => {
    localStorage.setItem("odontoma_suspended_flashcards", '["a"]')
    resetFreeFlashcardProgress(cards.map(card => card.id))
    expect(render()).not.toContain("Pregunta ya completada")
    expect(render()).toContain("Pregunta pendiente")
  })
  it("muestra nombres en las tarjetas propias/importadas sin cambiar sus IDs ni el avance", () => {
    const topicId = "topic-1793655178704-d6b27a37-54a7-41be-81a6-fe8ba88953ff"
    const personalCards = cards.map(card => ({ ...card, topic: topicId, chapter: "Nombre anterior" }))
    localStorage.setItem("odontoma_user_flashcard_topics", JSON.stringify([{ id: topicId, name: "Respiratorio" }]))
    saveFreeFlashcardResult("a", completed)
    const before = localStorage.getItem("odontoma_free_flashcard_progress_v1")
    const html = renderToStaticMarkup(<FreeFlashcardReviewScreen cards={personalCards} source="user" selectedTopic={topicId} onBack={() => {}} />)
    expect(html).toContain("Respiratorio")
    expect(html).not.toContain(topicId)
    expect(html).not.toContain("Nombre anterior")
    expect(html).not.toContain("Pregunta ya completada")
    expect(html).toContain("Pregunta pendiente")
    expect(localStorage.getItem("odontoma_free_flashcard_progress_v1")).toBe(before)
    expect(personalCards[0].topic).toBe(topicId)
  })
})

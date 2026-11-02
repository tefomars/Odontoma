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
})

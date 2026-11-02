import { beforeEach, describe, expect, it, vi } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { importOdontomaBackup } from "./backup"
import { advanceFreeReview, createFreeReview, undoFreeReview } from "./flashcardPractice"
import { FREE_FLASHCARD_PROGRESS_KEY, loadFreeFlashcardProgress, resetFreeFlashcardProgress, saveFreeFlashcardResult, selectFreeFlashcards } from "./freeFlashcardProgress"

const cards = ["a", "b", "c"].map(id => ({ id, chapter: "Capítulo", topic: "Tema", subtopic: "Subtema", front: id, back: "Respuesta" })) as Flashcard[]
const completed = { status: "completed", reviewedAt: "2026-11-02T00:00:00Z" } as const
const incorrect = { status: "incorrect", reviewedAt: "2026-11-02T00:00:00Z" } as const

describe("memoria persistente de Sin espera", () => {
  beforeEach(() => { installLocalStorageMock() })

  it("al salir y volver excluye completadas, incluso a mitad de una ronda", () => {
    saveFreeFlashcardResult("a", completed)
    // A new load represents returning to the app, not reusing component state.
    expect(selectFreeFlashcards(cards, loadFreeFlashcardProgress(), "mixed").map(card => card.id)).toEqual(["b", "c"])
    expect(loadFreeFlashcardProgress().a).toEqual(completed)
  })

  it("Otra vez queda pendiente entre sesiones; Nuevas e Incorrectas usan su propia memoria", () => {
    saveFreeFlashcardResult("a", completed)
    saveFreeFlashcardResult("b", incorrect)
    const progress = loadFreeFlashcardProgress()
    expect(selectFreeFlashcards(cards, progress, "mixed").map(card => card.id)).toEqual(["b", "c"])
    expect(selectFreeFlashcards(cards, progress, "new").map(card => card.id)).toEqual(["c"])
    expect(selectFreeFlashcards(cards, progress, "incorrect").map(card => card.id)).toEqual(["b"])
    saveFreeFlashcardResult("b", completed)
    expect(selectFreeFlashcards(cards, loadFreeFlashcardProgress(), "incorrect")).toEqual([])
  })

  it("al completar todo no recicla las tarjetas hasta reiniciar", () => {
    for (const card of cards) saveFreeFlashcardResult(card.id, completed)
    expect(selectFreeFlashcards(cards, loadFreeFlashcardProgress(), "mixed")).toEqual([])
    resetFreeFlashcardProgress(cards.map(card => card.id))
    expect(selectFreeFlashcards(cards, loadFreeFlashcardProgress(), "mixed")).toEqual(cards)
  })

  it("reiniciar el bloque conserva otros bancos, FSRS y suspendidas", () => {
    localStorage.setItem("odontoma_fsrs_storage", '{"cards":{"a":{"dueDate":"2099-01-01"}}}')
    localStorage.setItem("odontoma_suspended_flashcards", '["a"]')
    saveFreeFlashcardResult("a", completed)
    saveFreeFlashcardResult("b", incorrect)
    saveFreeFlashcardResult("otro-parcial", completed)
    resetFreeFlashcardProgress(["a", "b"])
    expect(loadFreeFlashcardProgress()).toEqual({ "otro-parcial": completed })
    expect(localStorage.getItem("odontoma_fsrs_storage")).toBe('{"cards":{"a":{"dueDate":"2099-01-01"}}}')
    expect(localStorage.getItem("odontoma_suspended_flashcards")).toBe('["a"]')
  })

  it("deshacer varias acciones restaura tanto el orden como la memoria anterior", () => {
    let session = createFreeReview(["a", "b", "c"])
    const history: { id: string; previous: ReturnType<typeof loadFreeFlashcardProgress>[string] | undefined }[] = []
    for (const repeat of [true, false, false, false]) {
      const id = session.queue[session.cursor]
      history.push({ id, previous: loadFreeFlashcardProgress()[id] })
      saveFreeFlashcardResult(id, repeat ? incorrect : completed)
      session = advanceFreeReview(session, repeat)
    }
    expect(selectFreeFlashcards(cards, loadFreeFlashcardProgress(), "mixed")).toEqual([])
    for (const action of history.reverse()) {
      saveFreeFlashcardResult(action.id, action.previous)
      session = undoFreeReview(session)
      expect(session.queue[session.cursor]).toBe(action.id)
    }
    expect(loadFreeFlashcardProgress()).toEqual({})
  })

  it("se restaura con el backup de estudiante sin necesitar cambios de formato", async () => {
    saveFreeFlashcardResult("a", completed)
    const saved = localStorage.getItem(FREE_FLASHCARD_PROGRESS_KEY)!
    localStorage.clear()
    await importOdontomaBackup(new File([JSON.stringify({
      app: "Odontoma", version: 1, exportedAt: completed.reviewedAt,
      localStorage: { [FREE_FLASHCARD_PROGRESS_KEY]: saved }
    })], "backup.json", { type: "application/json" }))
    expect(loadFreeFlashcardProgress()).toEqual({ a: completed })
  })

  it("ignora entradas dañadas sin aceptar estados desconocidos", () => {
    localStorage.setItem(FREE_FLASHCARD_PROGRESS_KEY, JSON.stringify({ a: completed, b: { status: "inventado" }, c: null }))
    expect(loadFreeFlashcardProgress()).toEqual({ a: completed })
    localStorage.setItem(FREE_FLASHCARD_PROGRESS_KEY, "{roto")
    expect(loadFreeFlashcardProgress()).toEqual({})
  })

  it("un fallo de almacenamiento no se presenta como un guardado exitoso", () => {
    saveFreeFlashcardResult("a", completed)
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("QuotaExceededError") })
    expect(() => saveFreeFlashcardResult("b", completed)).toThrow()
    expect(() => resetFreeFlashcardProgress(["a"])).toThrow()
    spy.mockRestore()
    expect(loadFreeFlashcardProgress()).toEqual({ a: completed })
  })
})

import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import { createEmptyCard } from "ts-fsrs"
import { installLocalStorageMock } from "@/test/localStorageMock"
import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { FlashcardStudyModeOptions } from "./FlashcardStudyModeSwitch"
import FlashcardSubjectScreen from "./FlashcardSubjectScreen"
import FlashcardSelectScreen from "./FlashcardSelectScreen"
import FlashcardReviewScreen from "./FlashcardReviewScreen"
import FreeFlashcardReviewScreen from "./FreeFlashcardReviewScreen"

const noop = () => {}
const cards = [{ id: "mode-test", chapter: "Prueba", topic: "Tema", subtopic: "Subtema", front: "¿Qué se está estudiando?", back: "Una tarjeta." }] as Flashcard[]

describe("elección de modo solo en Elige un deck", () => {
  beforeEach(() => { installLocalStorageMock() })

  it.each(["fsrs", "free"] as const)("muestra dos botones en columnas y una sola selección: %s", mode => {
    const html = renderToStaticMarkup(<FlashcardStudyModeOptions mode={mode} onChange={noop} />)
    expect(html).toContain("Elegir modo de flashcards")
    expect(html).toContain("grid-cols-2")
    expect(html.indexOf("Repetición espaciada")).toBeLessThan(html.indexOf("Solo flashcards"))
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toMatch(new RegExp(`data-flashcard-mode="${mode}" aria-pressed="true"`))
    expect(html).not.toContain(">Sin espera<")
  })

  it("explica la memoria del modo libre sin prometer reiniciar FSRS", () => {
    const html = renderToStaticMarkup(<FlashcardStudyModeOptions mode="free" onChange={noop} />)
    expect(html).toContain("hasta que reinicies el bloque")
    expect(html).toContain("sin cambiar tu progreso FSRS")
  })

  it("usa el selector en la app y en la vista editable del builder", () => {
    const props = { onBack: noop, onMainMenu: noop, onSelectSubject: noop, onSelectMyDecks: noop }
    expect(renderToStaticMarkup(<FlashcardSubjectScreen {...props} />)).toContain("data-flashcard-mode-picker")
    localStorage.setItem("odontoma_flashcard_study_mode_v1", "free")
    const before = localStorage.getItem("odontoma_flashcard_study_mode_v1")
    const html = renderToStaticMarkup(<FlashcardSubjectScreen {...props} editorMode />)
    expect(html).toContain("data-flashcard-mode-picker")
    expect(html).toContain('data-flashcard-mode="fsrs" aria-pressed="true"')
    expect(localStorage.getItem("odontoma_flashcard_study_mode_v1")).toBe(before)
    const builder = readFileSync(new URL("../../builder/LiveAppBuilder.tsx", import.meta.url), "utf8")
    expect(builder).toMatch(/<FlashcardSubjectScreen[\s\S]*?editorMode/)
  })

  it("no ocupa espacio con el selector al elegir capítulos", () => {
    const html = renderToStaticMarkup(<FlashcardSelectScreen onBack={noop} onShowSuspended={noop} onSelectTopic={noop} onSelectSubtopic={noop} />)
    expect(html).not.toContain("data-flashcard-mode-picker")
    expect(html).not.toContain("Modo de repaso de flashcards")
  })

  it("no muestra el selector durante el repaso programado ni libre", () => {
    for (const Component of [FlashcardReviewScreen, FreeFlashcardReviewScreen]) {
      const html = renderToStaticMarkup(<Component cards={cards} onBack={noop} />)
      expect(html).toContain(cards[0].front)
      expect(html).not.toContain("data-flashcard-mode-picker")
      expect(html).not.toContain("data-flashcard-mode-switch")
      expect(html).not.toContain("Modo de repaso de flashcards")
      expect(html).not.toContain('aria-pressed=')
    }
  })

  it("tampoco añade el selector cuando no hay tarjetas vencidas", () => {
    localStorage.setItem("odontoma_fsrs_storage", JSON.stringify({ cards: {
      "mode-test": { card: createEmptyCard(new Date("2099-01-01")), dueDate: "2099-01-01T00:00:00Z", reviewCount: 1, lapseCount: 0 }
    }, reviews: [] }))
    const html = renderToStaticMarkup(<FlashcardReviewScreen cards={cards} onBack={noop} />)
    expect(html).toContain("Nada pendiente por hoy")
    expect(html).toContain("Solo flashcards")
    expect(html).not.toContain("data-flashcard-mode-picker")
    expect(html).not.toContain('aria-pressed=')
  })
})

import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import cards, { ankiPlainText } from "./cards"
import source from "./raw/proceso_economico_ii.tsv?raw"
import { copyEdits, polishCardCopy } from "./copyEdits"
import { parseDelimitedRows } from "@/lib/delimitedText"
import { getStudyBank, resolveStudioBanks, compactStudioData } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { flashcardSubjectBlocks } from "@/content/appBuilder/flashcardSubjects"
import { organization, subjectSections } from "@/content/appBuilder/organization"
import FlashcardSubjectScreen from "@/components/flashcards/FlashcardSubjectScreen"
import FlashcardSelectScreen from "@/components/flashcards/FlashcardSelectScreen"
import { selectFlashcardScope } from "@/lib/flashcardPractice"
import { installLocalStorageMock } from "@/test/localStorageMock"

const rows = parseDelimitedRows(source.split("\n").filter(line => !line.startsWith("#")).join("\n"), "\t")
const noop = () => {}

describe("Proceso Económico II — source import, wording and integration", () => {
  beforeEach(() => { installLocalStorageMock() })
  it("retains every original note exactly once with its own stable progress ID", () => {
    expect(cards).toHaveLength(416)
    expect(cards).toHaveLength(rows.length)
    expect(new Set(cards.map(card => card.id)).size).toBe(cards.length)
    for (const [index, row] of rows.entries()) {
      expect(cards[index].id).toBe(`proceso-economico-ii-${Array.from(row[0], char => char.codePointAt(0)!.toString(16).padStart(2, "0")).join("")}`)
    }
    expect([...new Set(cards.map(card => card.chapter))]).toEqual(["Parcial 1", "Parcial 2", "Final"])
    expect(["Parcial 1", "Parcial 2", "Final"].map(chapter => cards.filter(card => card.chapter === chapter).length)).toEqual([237, 151, 28])
  })
  it("converts all five cloze notes and removes unsupported Anki/HTML/image artifacts", () => {
    expect(rows.filter(row => row[1] !== "Básico+")).toHaveLength(5)
    for (const card of cards) {
      expect(card.front).toMatch(/^¿/)
      expect(card.back.trim()).not.toBe("")
      expect(card.front + card.back).not.toMatch(/\{\{c\d|<\/?[a-z]|&nbsp;|paste-/)
    }
    expect(cards.find(card => card.front.includes("siete características"))?.back.split("\n")).toHaveLength(7)
    expect(ankiPlainText("Uno<br><ul><li>Dos</li><li>Tres</li></ul>")).toBe("Uno\n\n• Dos\n\n• Tres")
  })
  it("only applies traceable copyedits, preserving class answers outside those edits", () => {
    const ids = new Set(rows.map(row => row[0]))
    expect(Object.keys(copyEdits).every(id => ids.has(id))).toBe(true)
    for (const [index, row] of rows.entries()) {
      if (row[1] !== "Básico+") continue
      const expected = polishCardCopy(row[0], { front: ankiPlainText(row[3]), back: ankiPlainText(row[4]) })
      expect(cards[index].front).toBe(expected.front)
      expect(cards[index].back).toBe(expected.back)
    }
    expect(cards.find(card => card.front === "¿Cuál es la fórmula del PIB?")?.back).toContain("C + I + G + X")
    expect(cards.find(card => card.front.includes("ciclo de auge y crisis"))?.back).toContain("50 a 60")
    expect(cards.some(card => /taza de interés|prolectari|imposbilita|per dollar/.test(card.front + card.back))).toBe(false)
  })
  it("appears immediately beside Proceso I in secondary classes, in app and builder preview", () => {
    const secondary = subjectSections(flashcardSubjectBlocks, organization.flashcards).find(section => section.id === "secondary")!
    const index = secondary.items.findIndex(subject => subject.id === "proceso-economico-i")
    expect(secondary.items[index + 1].id).toBe("proceso-economico-ii")
    for (const editorMode of [false, true]) {
      const html = renderToStaticMarkup(<FlashcardSubjectScreen editorMode={editorMode} onBack={noop} onMainMenu={noop} onSelectSubject={noop} onSelectMyDecks={noop}/>)
      expect(html).toContain("Proceso Económico II")
      expect(html).toContain("416")
    }
  })
  it("opens its own 13 subtopics and allows studying each without cards from Proceso I", () => {
    const bank = getStudyBank("bank:proceso-economico-ii")!
    expect(bank.flashcards).toEqual(cards)
    expect(new Set(cards.map(card => card.subtopic)).size).toBe(13)
    const html = renderToStaticMarkup(<FlashcardSelectScreen subject="bank:proceso-economico-ii" onBack={noop} onShowSuspended={noop} onSelectTopic={noop} onSelectSubtopic={noop}/>)
    expect(html).toContain("Proceso Económico II")
    for (const chapter of bank.chapters) {
      const scoped = selectFlashcardScope(bank.flashcards, "default", chapter.id)
      expect(scoped.length).toBeGreaterThan(0)
      for (const subtopic of new Set(scoped.map(card => card.subtopic))) {
        const group = selectFlashcardScope(bank.flashcards, "default", chapter.id, `__subtopics:${subtopic}`)
        expect(group.length).toBeGreaterThan(0)
        expect(group.every(card => card.subject === "Proceso Económico II" && card.subtopic === subtopic)).toBe(true)
      }
    }
    expect(validateStudio({ version: 1, banks: [bank] })).toEqual([])
  })
  it("remains editable in the builder without duplicating the new official bank", () => {
    const library = { version: 1 as const, banks: structuredClone(resolveStudioBanks({ version: 1, banks: [] })) }
    const bank = library.banks.find(bank => bank.id === "proceso-economico-ii")!
    bank.flashcards[0].front = "¿Mi edición desde el builder?"
    const saved = compactStudioData(library)
    const restored = resolveStudioBanks(saved)
    expect(restored.filter(bank => bank.id === "proceso-economico-ii")).toHaveLength(1)
    expect(restored.find(bank => bank.id === "proceso-economico-ii")?.flashcards[0].front).toBe("¿Mi edición desde el builder?")
    expect(restored.find(bank => bank.id === "proceso-economico-i")).toEqual(library.banks.find(bank => bank.id === "proceso-economico-i"))
  })
})

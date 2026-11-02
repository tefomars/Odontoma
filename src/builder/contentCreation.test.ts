import { expect, it } from "vitest"
import { addLibraryContent, addWrittenContent, type ContentCreation } from "./contentCreation"
import { analyzeImport, readImport } from "./contentImport"
import { formatExample } from "./contentFormats"
const request: ContentCreation = { type: "multiple-choice", kind: "course", subject: "Prueba", title: "Materia", bankId: "bank", newBank: true, chapterId: "cap", newChapter: true, chapterTitle: "Capítulo", deckId: "deck", newDeck: true, image: "", quizAccess: true, flashcardAccess: false, sectionId: "primary", items: [] }
it("crea materia y capítulo con IDs nuevos sin modificar otros bancos ni preguntas", () => {
  const original = { version: 1 as const, banks: [] }
  const items = analyzeImport(readImport(JSON.stringify(formatExample("multiple-choice")), "multiple-choice"), "multiple-choice", []).map(r => r.item!)
  const next = addLibraryContent(original, { ...request, items }, () => "q1")
  expect(next.banks[0].questions[0]).toMatchObject({ id: "q1", chapter: "cap", correctAnswers: [1] })
  expect(original.banks).toEqual([])
  const after = addLibraryContent(next, { ...request, newBank: false, newChapter: false, type: "flashcards", items: [{ front: "F", back: "R" }] }, () => "f1")
  expect(after.banks[0].questions).toEqual(next.banks[0].questions)
  expect(after.banks[0].flashcards[0]).toMatchObject({ front: "F", back: "R", id: "f1", subject: "Prueba" })
  expect(() => addLibraryContent(original, { ...request, newBank: false }, () => "x")).toThrow()
})
it("crea escritos con explicación separada y no reemplaza preguntas existentes", () => {
  const first = addWrittenContent({ classes: [], decks: [] }, { ...request, type: "written", items: [{ prompt: "P", modelAnswer: "R", explanation: "E", acceptedPoints: ["A"] }] }, () => crypto.randomUUID())
  const after = addWrittenContent(first, { ...request, type: "written", newDeck: false, items: [{ prompt: "P2", modelAnswer: "R2" }] }, () => crypto.randomUUID())
  expect(first.decks[0].questions).toHaveLength(1)
  expect(after.decks[0].questions).toHaveLength(2)
  expect(after.decks[0].questions[0]).toMatchObject({ prompt: "P", modelAnswer: "R", explanation: "E" })
})

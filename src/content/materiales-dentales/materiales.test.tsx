import { afterEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { materialBlocks, materialesBank, materialesCards, materialesQuestions } from "."
import { block } from "./model"
import snapshot from "./source-snapshot.json"
import review from "./review.json"
import { compactStudioData, getStudyBank, resolveStudioBanks } from "../studio/catalog"
import { validateStudio } from "../studio/schema"
import { homeSubjects } from "../appBuilder"
import { flashcardSubjectBlocks } from "../appBuilder/flashcardSubjects"
import SetupScreen from "@/components/SetupScreen"
import FlashcardSelectScreen from "@/components/flashcards/FlashcardSelectScreen"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { flashcardChapterLabel } from "@/lib/studyLabels"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { studyImagePosition } from "@/lib/studyImagePosition"

const noop = () => {}
const normalize = (s: string) => s.toLocaleLowerCase("es").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/g, "")
const sourceTitles: Record<string, string> = { "md-glosario-p1": "Glosario P1", "md-amalgamas": "Amalgamas", "md-historia": "Señores de la historia", "md-glosario-p2": "Glosario P2", "md-composites": "Composites", "md-adhesivos": "Adhesivos", "md-ionomeros": "Ionómeros de vidrio" }
afterEach(() => vi.unstubAllGlobals())

describe("Materiales dentales — bancos separados y revisados", () => {
  it("incluye siete bloques, 192 tarjetas atómicas y 120 preguntas válidas", () => {
    expect(materialBlocks).toHaveLength(7)
    expect(materialesCards).toHaveLength(192)
    expect(materialesQuestions).toHaveLength(120)
    expect(materialBlocks.map(b => [b.cards.length, b.questions.length])).toEqual([[14, 10], [22, 14], [28, 18], [21, 14], [39, 22], [32, 20], [36, 22]])
    expect(validateStudio({ version: 1, banks: [materialesBank] })).toEqual([])
    expect(new Set([...materialesCards, ...materialesQuestions].map(item => item.id)).size).toBe(312)
    expect(new Set(materialesCards.map(card => normalize(card.front))).size).toBe(materialesCards.length)
    expect(new Set(materialesQuestions.map(q => normalize(q.question))).size).toBe(materialesQuestions.length)
    for (const card of materialesCards) {
      expect(card.front.includes("¿"), card.id).toBe(true)
      expect(card.front.endsWith("?"), card.id).toBe(true)
      expect(card.back.trim().split(/\s+/).length, card.id).toBeLessThanOrEqual(45)
      expect(card.front).not.toMatch(/mencione cosas|según los apuntes|en este capítulo|qué es esto/i)
      expect(card.subtopic).toBeTruthy()
    }
  })

  it("no extrae distractores de otras respuestas y no distingue la clave por su longitud", () => {
    expect([0, 1, 2, 3].map(index => materialesQuestions.filter(q => q.correctAnswers[0] === index).length)).toEqual([30, 30, 30, 30])
    const fronts = new Set(materialesCards.map(card => normalize(card.front)))
    const originalPrompts = new Set(snapshot.decks.flatMap(deck => deck.questions.map(q => normalize(q.prompt))))
    let longest = 0
    for (const q of materialesQuestions) {
      expect(q.options).toHaveLength(4)
      expect(q.correctAnswers).toHaveLength(1)
      expect(new Set(q.options.map(normalize)).size, q.id).toBe(4)
      expect(q.options.join(" ")).not.toMatch(/todas las anteriores|ninguna de las anteriores/i)
      expect(fronts.has(normalize(q.question)), q.id).toBe(false)
      expect(originalPrompts.has(normalize(q.question)), q.id).toBe(false)
      expect(q.explanation.length, q.id).toBeGreaterThan(75)
      const lengths = q.options.map(option => option.length)
      if (lengths[q.correctAnswers[0]] > Math.max(...lengths.filter((_, index) => index !== q.correctAnswers[0]))) longest++
      // Single-word names legitimately differ in length. Guard explanatory
      // alternatives against the old one-essay-and-three-tiny-options problem.
      if (Math.max(...lengths) > 45) expect(Math.max(...lengths) / Math.min(...lengths), q.id).toBeLessThan(2)
    }
    expect(longest / materialesQuestions.length).toBeLessThan(0.25)
  })

  it("rastrea las 97 preguntas de origen o documenta explícitamente lo pendiente", () => {
    expect(snapshot.decks.reduce((sum, deck) => sum + deck.questions.length, 0)).toBe(97)
    for (const item of materialBlocks) {
      const source = snapshot.decks.find(deck => deck.title === sourceTitles[item.id])!
      const held = new Set(review.issues.filter(issue => issue.block === source.title).flatMap(issue => issue.fullyHeldQuestions || []))
      const cardSources = new Set(item.cardDrafts.flatMap(row => Array.isArray(row[1]) ? [...row[1]] : [row[1]]))
      const quizSources = new Set(item.quizDrafts.flatMap(row => Array.isArray(row[1]) ? [...row[1]] : [row[1]]))
      const missing: string[] = []
      source.questions.forEach((question, index) => {
        const number = index + 1
        if (held.has(number)) return
        if (!cardSources.has(number)) missing.push(`Flashcards #${number}: ${question.prompt}`)
        if (!quizSources.has(number)) missing.push(`Quiz #${number}: ${question.prompt}`)
      })
      expect(missing, source.title).toEqual([])
      for (const number of [...cardSources, ...quizSources]) expect(Number(number)).toBeLessThanOrEqual(source.questions.length)
    }
    expect(review.issues.every(issue => issue.status === "pending")).toBe(true)
  })

  it("no convierte cifras o generalizaciones pendientes en respuestas nuevas", () => {
    const answers = [...materialesCards.map(card => card.back), ...materialesQuestions.map(q => q.options[q.correctAnswers[0]])].join("\n")
    expect(answers).not.toMatch(/1:3|380.?450|1000.?1500|45%|50%|85%|Dyract|baja resistencia.*bulk|cohesión.*más fuerte|halógena.*espectro.*limitado|Ca\+\b/iu)
    const smear = materialesQuestions.find(q => q.id === "md-adhesivos-q-004")!
    expect(smear.options[smear.correctAnswers[0]]).toContain("parcialmente")
    expect(materialesCards.find(c => c.id === "md-glosario-p1-f-006")!.back).toBe("Su rigidez.")
  })

  it("conserva IDs y claves al reordenar la autoría sin cambiar el texto de las preguntas", () => {
    const item = materialBlocks[4]
    const reversed = block("composites", item.title, 2, item.description, [...item.cardDrafts].reverse(), [...item.quizDrafts].reverse())
    for (const q of item.questions) expect(reversed.questions.find(other => other.id === q.id)).toEqual(q)
    for (const card of item.cards) expect(reversed.cards.find(other => other.id === card.id)).toEqual(card)
  })

  it("incluye fotos locales para la materia y sus siete bloques, también editables desde Builder", () => {
    for (const chapter of materialesBank.chapters) {
      expect(chapter.image).toMatch(/^\/media\/materiales-dentales\/[\w-]+\.jpg$/)
      const path = resolve("public", chapter.image.slice(1))
      expect(existsSync(path)).toBe(true)
      expect(readFileSync(path).subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]))
    }
    const cover = "/media/materiales-dentales/composites.jpg"
    expect(homeSubjects.find(subject => subject.id === materialesBank.id)?.image).toBe(cover)
    expect(flashcardSubjectBlocks.find(subject => subject.id === materialesBank.id)?.image).toBe(cover)
    expect(existsSync(resolve("public/media/materiales-dentales/credits.html"))).toBe(true)
    expect(studyImagePosition("/media/materiales-dentales/ionomeros.jpg")).toBe("center bottom")
    expect(studyImagePosition("/media/mi-foto-nueva.jpg")).toBe("center")
  })

  it("expone los accesos correctos y todos los subtemas en flashcards", () => {
    installLocalStorageMock()
    expect(homeSubjects.find(subject => subject.id === materialesBank.id)?.destination).toBe("bank:materiales-dentales")
    expect(flashcardSubjectBlocks.find(subject => subject.id === materialesBank.id)?.destination).toBe("bank:materiales-dentales")
    expect(getStudyBank("bank:materiales-dentales")?.flashcards).toEqual(materialesCards)
    expect(flashcardChapterLabel(materialesCards[0], materialesBank.chapters)).toBe("Parcial 1")
    expect(flashcardChapterLabel({ chapter: "Capítulo 16" }, materialesBank.chapters)).toBe("Capítulo 16")
    const html = renderToStaticMarkup(<FlashcardSelectScreen subject="bank:materiales-dentales" onBack={noop} onShowSuspended={noop} onSelectTopic={noop} onSelectSubtopic={noop}/>)
    expect(html).toContain("Materiales dentales")
    expect(html).toContain("Parcial 1")
    expect(html).toContain("Parcial 2")
    for (const item of materialBlocks) expect(html).toContain(item.title)
    for (const chapter of materialesBank.chapters) expect(html).toContain(chapter.image)
    expect(html).not.toContain("Capítulo 4")
    expect(html).not.toMatch(/>md-(?:glosario|amalgamas|historia|composites|adhesivos|ionomeros)/)
  })

  it("muestra la selección de capítulos de opción múltiple separada por parcial", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) })
    const html = renderToStaticMarkup(<SetupScreen title="Materiales dentales" chapters={materialesBank.chapters} questionCountsByChapter={Object.fromEntries(materialBlocks.map(item => [item.id, item.questions.length]))} selectedChapters={[]} setSelectedChapters={noop} selectedDifficulties={["easy", "medium", "hard"]} setSelectedDifficulties={noop} questionCount={20} setQuestionCount={noop} practiceMode="smart" setPracticeMode={noop} availableQuestionsCount={120} modeCounts={{ new: 120, incorrect: 0, correct: 0, failed: 0, all: 120 }} onStart={noop}/>)
    expect(html).toContain("Parcial 1")
    expect(html).toContain("Parcial 2")
    for (const item of materialBlocks) expect(html).toContain(item.title)
  })

  it("permite editar, quitar y restaurar desde builder sin sobrescribir otros bancos", () => {
    const original = resolveStudioBanks({ version: 1, banks: [] })
    const draft = { version: 1 as const, banks: structuredClone(original) }
    const bank = draft.banks.find(bank => bank.id === materialesBank.id)!
    const removedQuestion = bank.questions.pop()!.id, removedCard = bank.flashcards.pop()!.id
    bank.questions[0].question = "¿Mi pregunta personalizada?"
    bank.flashcards[0].back = "Mi respuesta personalizada."
    bank.chapters[0].title = "Propiedades fundamentales"
    const restored = resolveStudioBanks(compactStudioData(draft))
    const actual = restored.find(item => item.id === bank.id)!
    expect(actual.questions[0].question).toBe("¿Mi pregunta personalizada?")
    expect(actual.flashcards[0].back).toBe("Mi respuesta personalizada.")
    expect(actual.chapters[0].title).toBe("Propiedades fundamentales")
    expect(actual.questions.some(q => q.id === removedQuestion)).toBe(false)
    expect(actual.flashcards.some(card => card.id === removedCard)).toBe(false)
    expect(restored.filter(item => item.id !== bank.id)).toEqual(original.filter(item => item.id !== bank.id))
    expect(validateStudio({ version: 1, banks: restored })).toEqual([])
  })
})

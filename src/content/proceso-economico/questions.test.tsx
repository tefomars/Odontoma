import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { procesoIQuestions, procesoIIQuestions } from "./index"
import { defineQuestions, type QuestionDraft } from "./questionBank"
import { getStudyBank, compactStudioData, resolveStudioBanks } from "../studio/catalog"
import { validateStudio } from "../studio/schema"
import { homeSubjects } from "../appBuilder"
import { organization, subjectSections } from "../appBuilder/organization"
import procesoICards from "../flashcards/proceso-economico-i/cards"
import procesoIICards from "../flashcards/proceso-economico-ii/cards"
import HomeScreen from "@/components/HomeScreen"
import SetupScreen from "@/components/SetupScreen"

const all = [...procesoIQuestions, ...procesoIIQuestions]
const noop = () => {}
const normalize = (text: string) => text.toLocaleLowerCase("es").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9+−-]/g, "")
const key = (id: string) => {
  const q = all.find(q => q.id === id)!
  return q.options[q.correctAnswers[0]]
}

describe("Proceso Económico I y II — integrated multiple-choice banks", () => {
  afterEach(() => { vi.unstubAllGlobals() })
  it("provides 60 and 80 questions with valid, unique choices, keys and stable IDs", () => {
    expect(procesoIQuestions).toHaveLength(60)
    expect(procesoIIQuestions).toHaveLength(80)
    expect(new Set(all.map(q => q.id)).size).toBe(all.length)
    for (const questions of [procesoIQuestions, procesoIIQuestions]) {
      expect(new Set(questions.map(q => normalize(q.question))).size).toBe(questions.length)
      for (const q of questions) {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options.map(normalize)).size, q.id).toBe(4)
        expect(q.correctAnswers).toHaveLength(1)
        expect(q.correctAnswers[0]).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswers[0]).toBeLessThan(4)
        expect(q.explanation.length).toBeGreaterThan(65)
        expect(q.options.join(" ")).not.toMatch(/todas las anteriores|ninguna de las anteriores/i)
      }
    }
    expect(validateStudio({ version: 1, banks: [getStudyBank("proceso-economico-i")!, getStudyBank("proceso-economico-ii")!] })).toEqual([])
  })

  it("covers both Proceso I partials and all thirteen Proceso II subtopics", () => {
    expect(["Parcial 1", "Parcial 2"].map(c => procesoIQuestions.filter(q => q.chapter === c).length)).toEqual([30, 30])
    expect(["Parcial 1", "Parcial 2", "Final"].map(c => procesoIIQuestions.filter(q => q.chapter === c).length)).toEqual([40, 30, 10])
    const topics = new Set(procesoIIQuestions.map(q => q.topic))
    for (const subtopic of new Set(procesoIICards.map(c => c.subtopic))) expect(topics.has(subtopic!)).toBe(true)
    expect(new Set(procesoIQuestions.map(q => q.topic)).size).toBe(14)
    expect(getStudyBank("proceso-economico-i")!.chapters.map(c => c.questionCount)).toEqual([30, 30])
    expect(getStudyBank("proceso-economico-ii")!.chapters.map(c => c.questionCount)).toEqual([40, 30, 10])
  })

  it("uses new stems rather than reusing flashcard questions verbatim", () => {
    const flashcardFronts = new Set([...procesoICards, ...procesoIICards].map(c => normalize(c.front)))
    for (const q of all) expect(flashcardFronts.has(normalize(q.question)), q.id).toBe(false)
    expect(getStudyBank("proceso-economico-i")!.flashcards).toEqual(procesoICards)
    expect(getStudyBank("proceso-economico-ii")!.flashcards).toEqual(procesoIICards)
    expect(procesoICards).toHaveLength(195)
    expect(procesoIICards).toHaveLength(416)
  })

  it("keeps option lengths comparable and distributes keys without a longest-answer pattern", () => {
    // Mechanical regression guards, not a substitute for reviewing plausibility.
    for (const questions of [procesoIQuestions, procesoIIQuestions]) {
      const counts = [0, 1, 2, 3].map(i => questions.filter(q => q.correctAnswers[0] === i).length)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2)
      let longestKeys = 0
      for (const q of questions) {
        const lengths = q.options.map(o => o.length)
        expect(Math.max(...lengths) / Math.min(...lengths), q.id).toBeLessThan(1.9)
        if (lengths[q.correctAnswers[0]] > Math.max(...lengths.filter((_, i) => i !== q.correctAnswers[0]))) longestKeys++
      }
      expect(longestKeys / questions.length).toBeLessThan(0.35)
    }
  })

  it("retains answer semantics and progress IDs when authored rows are reordered", () => {
    const rows: QuestionDraft[] = [["001", "Tema", "Caso A", ["Clave A", "Error A", "Error B", "Error C"], "Explicación A"], ["004", "Tema", "Caso B", ["Clave B", "Error A", "Error B", "Error C"], "Explicación B"]]
    const first = defineQuestions("test", "Parcial 1", rows)
    const reversed = defineQuestions("test", "Parcial 1", [...rows].reverse())
    for (const question of first) {
      expect(reversed.find(q => q.id === question.id)).toEqual(question)
      expect(question.options[question.correctAnswers[0]]).toBe(question.id === "test-001" ? "Clave A" : "Clave B")
    }
  })

  it("checks numeric keys against independent calculations and explicit assumptions", () => {
    expect(key("pe1-p1-004")).toMatch(/Ana en camisas y Luis en panes/)
    expect(4 / 8).toBeGreaterThan(2 / 6) // opportunity cost of one bread in shirts
    expect(key("pe1-p1-015")).toBe("Q20 para el comprador y Q20 para el vendedor.")
    expect(100 - 80).toBe(80 - 60)
    expect(key("pe1-p2-004")).toContain(`2 a ${4000 / 1600}`)
    expect(key("pe1-p2-009")).toContain("Q1,000")
    expect(1100 / 1.1).toBeCloseTo(1000)
    expect(key("pe1-p2-014")).toContain(`${76 - 60} unidades`)
    expect(key("pe1-p2-016")).toContain(`Q${8 * 5} de ingreso y Q45`)
    expect(key("pe1-p2-018")).toContain(`${(4 * 10 + 15) / 5} unidades`)
    expect(key("pe2-p1-010")).toContain("cae 20%")
    expect((1 - (500 / 125) / (500 / 100)) * 100).toBeCloseTo(20)
    expect(key("pe2-p1-016")).toContain("Q5,000 de depósitos totales")
    expect(1000 / 0.2).toBe(5000)
    expect(key("pe2-p1-029")).toMatch(/^5%/)
    expect((126 - 120) / 120 * 100).toBe(5)
    expect(key("pe2-p1-034")).toMatch(/^970/)
    expect(600 + 150 + 200 + 100 - 80).toBe(970)
    expect(key("pe2-p2-010")).toContain("Q100 a Q80")
    expect([0.1 * 1000, 0.2 * 400]).toEqual([100, 80])
    expect(key("pe2-p2-023")).toContain("saldo corriente de +10")
    expect(100 - 120 + 30).toBe(10)
  })

  it("registers adjacent secondary-class cards in the app and builder preview", () => {
    const secondary = subjectSections(homeSubjects, organization.quizzes).find(s => s.id === "secondary")!
    const index = secondary.items.findIndex(s => s.id === "proceso-economico-i")
    expect(index).toBeGreaterThanOrEqual(0)
    expect(secondary.items[index + 1].id).toBe("proceso-economico-ii")
    for (const editorMode of [false, true]) {
      const html = renderToStaticMarkup(<HomeScreen onSelectSubject={noop} editorMode={editorMode}/>)
      expect(html).toContain("Proceso Económico I")
      expect(html).toContain("Proceso Económico II")
      expect(html).toContain("proceso-economico") // bundled course photo
    }
  })

  it("exposes the correct partials in setup without mixing the two courses", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) })
    vi.stubGlobal("localStorage", { getItem: () => null })
    for (const id of ["proceso-economico-i", "proceso-economico-ii"]) {
      const bank = getStudyBank(id)!
      const counts = Object.fromEntries(bank.chapters.map(c => [c.id, c.questionCount]))
      const html = renderToStaticMarkup(<SetupScreen title={bank.title} chapters={bank.chapters} questionCountsByChapter={counts} selectedChapters={[]} setSelectedChapters={noop} selectedDifficulties={["easy", "medium", "hard"]} setSelectedDifficulties={noop} questionCount={20} setQuestionCount={noop} practiceMode="all" setPracticeMode={noop} availableQuestionsCount={0} modeCounts={{ new: 0, incorrect: 0, correct: 0, failed: 0, all: 0 }} onStart={noop}/>)
      expect(html).toContain("Parcial 1")
      expect(html).toContain("Parcial 2")
      expect(html.includes(">Final<")).toBe(id.endsWith("-ii"))
      expect(bank.questions.every(q => q.id.startsWith(id.endsWith("-ii") ? "pe2-" : "pe1-"))).toBe(true)
    }
  })

  it("roundtrips builder edits and deliberate removals without changing flashcards or other banks", () => {
    const original = resolveStudioBanks({ version: 1, banks: [] })
    const library = { version: 1 as const, banks: structuredClone(original) }
    const bank = library.banks.find(b => b.id === "proceso-economico-ii")!
    const removed = bank.questions.pop()!.id
    bank.questions[0].question = "¿Mi caso editado en el builder?"
    bank.questions[0].options = ["Mi clave", "Otro caso", "Tercer caso", "Cuarto caso"]
    bank.questions[0].correctAnswers = [0]
    const saved = compactStudioData(library)
    const restored = resolveStudioBanks(saved)
    const edited = restored.find(b => b.id === bank.id)!
    expect(edited.questions[0].question).toBe("¿Mi caso editado en el builder?")
    expect(edited.questions[0].options[edited.questions[0].correctAnswers[0]]).toBe("Mi clave")
    expect(edited.questions.some(q => q.id === removed)).toBe(false)
    expect(edited.flashcards).toEqual(procesoIICards)
    expect(restored.filter(b => b.id === bank.id)).toHaveLength(1)
    expect(restored.filter(b => b.id !== bank.id)).toEqual(original.filter(b => b.id !== bank.id))
    expect(validateStudio({ version: 1, banks: restored })).toEqual([])
  })
})

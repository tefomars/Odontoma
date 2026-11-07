import { beforeEach, describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { StudyBank } from "../studio/schema"
import { validateStudio } from "../studio/schema"
import { studioBanks } from "../studio/catalog"
import { createCumulativePrePartial, selectPrePartialQuestions } from "./cumulative"
import { getCumulativePrePartialBank, getCumulativeQuestionTitle, getPrePartialBank, prePartialSessionBanks } from "./banks"
import { refreshPausedQuizQuestions } from "@/lib/pausedQuizSession"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { loadStats, resetQuestionBankStats, saveStats } from "@/lib/stats"
import { loadQuizHistory, removeQuizAttemptsForQuestionIds, saveQuizAttempt } from "@/lib/quizHistory"
import PrePartialReviewScreen from "@/components/PrePartialReviewScreen"

function bank(id: string, count: number): StudyBank {
  return { id, title: id, subject: "Clase de prueba", kind: "prepartial", flashcards: [], chapters: [],
    questions: Array.from({ length: count }, (_, index) => ({
      id: `question-${index}`, chapter: id, topic: "Tema", type: "single", difficulty: "medium",
      question: `¿Pregunta ${index} de ${id}?`, options: ["A", "B"], correctAnswers: [0],
      explanation: "Explicación de prueba.", tags: [id],
    })),
  }
}

describe("examen final acumulativo", () => {
  beforeEach(installLocalStorageMock)

  it("deriva el final de los parciales reales, sin guardarlo como banco duplicado", () => {
    const final = getCumulativePrePartialBank("Histología")!
    expect(final).toBeDefined()
    expect(final.chapters.map(chapter => chapter.id)).toEqual(["Parcial 1 · Cito II", "Parcial 2 · Cito II", "Parcial 3 · Cito II", "Parcial 4 · Cito II"])
    expect(final.questions).toHaveLength(393)
    expect(final.flashcards).toEqual([])
    expect(studioBanks.some(item => item.id === final.id)).toBe(false)
    expect(getPrePartialBank(final.id)).toBe(final)
    expect(getCumulativeQuestionTitle(`bank:${final.id}`, final.chapters[0].id)).toBe(`${final.title} · ${final.chapters[0].title}`)
    expect(getCumulativeQuestionTitle("bank:histologia", "Capítulo 21")).toBeUndefined()
    expect(prePartialSessionBanks.filter(item => item.id === final.id)).toHaveLength(1)
    expect(validateStudio({ version: 1, banks: [final] })).toEqual([])
  })

  it("incluye solo bancos de repaso habilitados de esa clase y exige al menos dos", () => {
    const a = bank("Parcial 1", 4)
    const b = bank("Parcial 2", 3)
    const sources = [a, b, { ...bank("Archivado", 10), archived: true }, { ...bank("Oculto", 10), enabled: false }, { ...bank("Otro", 10), subject: "Otra clase" }, { ...bank("Normal", 10), kind: "course" as const }, bank("Vacío", 0)]
    expect(createCumulativePrePartial(sources, a.subject)?.questions).toHaveLength(7)
    expect(createCumulativePrePartial([a], a.subject)).toBeUndefined()
    expect(createCumulativePrePartial(sources, "Otra clase")).toBeUndefined()
    const edited = structuredClone(sources)
    edited[0].questions[0].question = "¿Contenido actualizado desde Builder?"
    edited[1].questions.pop()
    const final = createCumulativePrePartial(edited, a.subject, "Simulacro final", "Nombre visible")!
    expect(final.title).toBe("Simulacro final · Nombre visible")
    expect(final.questions).toHaveLength(6)
    expect(final.questions[0].question).toBe("¿Contenido actualizado desde Builder?")
  })

  it("mantiene IDs finales estables y aislados incluso si dos bancos comparten IDs locales", () => {
    const sources = [bank("Parcial 1", 4), bank("Parcial 2", 4)]
    const before = structuredClone(sources)
    const final = createCumulativePrePartial(sources, sources[0].subject)!
    expect(new Set(final.questions.map(question => question.id)).size).toBe(8)
    const originalIds = new Set(sources.flatMap(item => item.questions.map(question => question.id)))
    expect(final.questions.every(question => !originalIds.has(question.id))).toBe(true)
    expect(createCumulativePrePartial([...sources].reverse(), sources[0].subject)!.questions.map(question => question.id).sort()).toEqual(final.questions.map(question => question.id).sort())
    expect(createCumulativePrePartial(sources, sources[0].subject, "Renombrado")!.questions.map(question => question.id)).toEqual(final.questions.map(question => question.id))
    selectPrePartialQuestions(final, 6, "mixed")
    expect(sources).toEqual(before)
  })

  it("reparte una tanda entre parciales y mezcla sin duplicar preguntas", () => {
    const sources = [bank("Parcial 1", 30), bank("Parcial 2", 30), bank("Parcial 3", 30), bank("Parcial 4", 30)]
    const final = createCumulativePrePartial(sources, sources[0].subject)!
    for (const amount of [10, 20, 51, 120]) {
      const selected = selectPrePartialQuestions(final, amount, "mixed")
      expect(selected).toHaveLength(amount)
      expect(new Set(selected.map(question => question.id)).size).toBe(amount)
      const counts = sources.map(source => selected.filter(question => question.chapter === source.id).length)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
    }
  })

  it("agota bancos pequeños sin repetirlos y aplica filtros al progreso del final", () => {
    const sources = [bank("Parcial 1", 2), bank("Parcial 2", 20)]
    const final = createCumulativePrePartial(sources, sources[0].subject)!
    expect(selectPrePartialQuestions(final, 100, "mixed")).toHaveLength(22)
    expect(selectPrePartialQuestions(final, 20, "mixed").filter(question => question.chapter === sources[0].id)).toHaveLength(2)
    const [a, b] = final.questions
    const stats = { [a.id]: { correct: 1, incorrect: 0 }, [b.id]: { correct: 0, incorrect: 1 }, "question-0": { correct: 3, incorrect: 4 } }
    expect(selectPrePartialQuestions(final, 100, "new", stats)).toHaveLength(20)
    expect(selectPrePartialQuestions(final, 100, "incorrect", stats).map(question => question.id)).toEqual([b.id])
    expect(selectPrePartialQuestions(final, 10, "incorrect", {})).toEqual([])
    for (const amount of [0, -1, Number.NaN, Infinity]) expect(selectPrePartialQuestions(final, amount, "mixed")).toEqual([])
  })

  it("permite guardar y reanudar con contenido vigente y sin perder los IDs del final", () => {
    const sources = [bank("Parcial 1", 3), bank("Parcial 2", 3)]
    const final = createCumulativePrePartial(sources, sources[0].subject)!
    const saved = structuredClone(final.questions.slice(0, 2))
    sources[0].questions[0].explanation = "Nueva explicación del dueño."
    sources[0].questions.splice(1, 1)
    const refreshed = createCumulativePrePartial(sources, sources[0].subject)!
    const questions = refreshPausedQuizQuestions(saved, refreshed.questions)
    expect(questions).toHaveLength(1)
    expect(questions[0].id).toBe(saved[0].id)
    expect(questions[0].explanation).toBe("Nueva explicación del dueño.")
  })

  it("reinicia respuestas e intentos finales sin borrar progreso ni intentos de un parcial", () => {
    const sources = [bank("Parcial 1", 2), bank("Parcial 2", 2)]
    const final = createCumulativePrePartial(sources, sources[0].subject)!
    const original = sources[0].questions[0]
    const derived = final.questions[0]
    const record = { correct: 1, incorrect: 1 }
    saveStats({ totalAnswered: 4, totalCorrect: 2, questions: { [original.id]: record, [derived.id]: record }, tags: { [original.tags![0]]: record, [derived.tags![0]]: record } })
    for (const [id, question] of [["original", original], ["final", derived]] as const) {
      saveQuizAttempt({ id, title: id, subject: sources[0].subject, completedAt: "2026-11-07T12:00:00Z", score: 0, total: 1, responses: [{ questionId: question.id, question: question.question, selectedAnswers: ["B"], correctAnswers: ["A"], isCorrect: false }] })
    }
    resetQuestionBankStats(final.questions)
    removeQuizAttemptsForQuestionIds(final.questions.map(question => question.id))
    expect(loadStats().questions).toEqual({ [original.id]: record })
    expect(loadStats().tags).toEqual({ [original.tags![0]]: record })
    expect(loadStats().totalAnswered).toBe(2)
    expect(loadQuizHistory().map(attempt => attempt.id)).toEqual(["original"])
  })

  it("muestra el final después de los parciales, con cantidades y reinicio propios", () => {
    const html = renderToStaticMarkup(createElement(PrePartialReviewScreen, {
      initialReviewType: "Opción múltiple", initialSubject: "Histología",
      onBack() {}, onMainMenu() {}, onStartMultipleChoice() {}, onStartFlashcards() {}, onResetPartial() {}, onContinuePartial() {}, onReviewTypeChange() {},
    }))
    expect(html).toContain("393")
    expect(html).toContain("Reiniciar solo el examen final")
    expect(html.lastIndexOf("Repaso acumulativo")).toBeGreaterThan(html.indexOf("Parcial 4 · Cito II"))
  })
})

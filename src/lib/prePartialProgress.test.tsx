import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createEmptyCard } from "ts-fsrs"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { getPrePartialBank, getCumulativePrePartialBank } from "@/content/prePartial/banks"
import { selectPrePartialQuestions } from "@/content/prePartial/cumulative"
import PrePartialReviewScreen from "@/components/PrePartialReviewScreen"
import { loadStats, recordQuestionAnswer, resetQuestionBankStats } from "./stats"
import { saveFreeFlashcardResult } from "./freeFlashcardProgress"
import { saveFsrsStorage } from "./flashcardStorage"
import { countPrePartialProgress, loadPrePartialPreferences, prePartialPreferenceKey, readPrePartialProgress, savePrePartialPreference, PREPARTIAL_PREFERENCES_KEY } from "./prePartialProgress"
import { dismissStorageFailure, storageFailure } from "./storageSafety"
import { notifyStudyProgress, subscribeStudyProgress } from "./studyProgressEvents"

const partial = getPrePartialBank("Parcial 1 · Cito II")!
const final = getCumulativePrePartialBank("Histología")!
const counts = () => countPrePartialProgress(partial, "questions", "fsrs", readPrePartialProgress("questions", "fsrs"))

describe("progreso y Nuevas en repaso pre-parcial", () => {
  beforeEach(() => { installLocalStorageMock(); dismissStorageFailure() })

  it("guarda cada comprobación, sin terminar la tanda, y Nuevas no la repite al volver", () => {
    const first = selectPrePartialQuestions(partial, 20, "new", loadStats().questions)
    const answered = first.slice(0, 7)
    for (const [index, question] of answered.entries()) expect(recordQuestionAnswer(question, index % 2 === 0)).not.toBeNull()
    const afterReturning = selectPrePartialQuestions(partial, 200, "new", loadStats().questions)
    expect(afterReturning).toHaveLength(partial.questions.length - 7)
    expect(afterReturning.some(q => answered.some(old => q.id === old.id))).toBe(false)
    expect(counts()).toMatchObject({ total: 108, done: 7, new: 101, incorrect: 3 })
  })

  it("una App montada antes de otra respuesta no la borra ni selecciona desde su copia vieja", () => {
    const staleAppSnapshot = loadStats()
    const [a, b] = partial.questions
    recordQuestionAnswer(a, true) // Another tab answers while the first App stays open.
    recordQuestionAnswer(b, false)
    expect(staleAppSnapshot.questions).toEqual({})
    expect(Object.keys(loadStats().questions)).toEqual([a.id, b.id])
    expect(loadStats()).toMatchObject({ totalAnswered: 2, totalCorrect: 1 })
    expect(selectPrePartialQuestions(partial, 200, "new", loadStats().questions).some(q => q.id === a.id || q.id === b.id)).toBe(false)
  })

  it("cuenta preguntas únicas, conserva otros parciales y deja el final independiente", () => {
    const question = partial.questions[0]
    recordQuestionAnswer(question, false)
    recordQuestionAnswer(question, true)
    recordQuestionAnswer(getPrePartialBank("Parcial 2 · Cito II")!.questions[0], true)
    expect(counts()).toMatchObject({ done: 1, new: 107 })
    expect(countPrePartialProgress(final, "questions", "fsrs", readPrePartialProgress("questions", "fsrs"))).toMatchObject({ done: 0, total: 393 })
    resetQuestionBankStats(partial.questions)
    expect(counts().done).toBe(0)
    expect(Object.keys(loadStats().questions)).toHaveLength(1)
  })

  it("rechaza la comprobación si no se puede guardar, conservando el progreso anterior", () => {
    recordQuestionAnswer(partial.questions[0], true)
    const before = loadStats()
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota") })
    expect(recordQuestionAnswer(partial.questions[1], false)).toBeNull()
    expect(storageFailure()).toContain("No se pudo guardar")
    spy.mockRestore()
    expect(loadStats()).toEqual(before)
  })

  it("cuenta tarjetas según su modo sin mezclar memorias ni afectar FSRS", () => {
    const [a, b, c] = partial.flashcards
    saveFreeFlashcardResult(a.id, { status: "completed", reviewedAt: "2026-11-08" })
    saveFreeFlashcardResult(b.id, { status: "incorrect", reviewedAt: "2026-11-08" })
    saveFsrsStorage({ cards: { [c.id]: { card: createEmptyCard(new Date("2099-01-01")), dueDate: "2099-01-01", reviewCount: 1, lapseCount: 0 } }, reviews: [] })
    expect(countPrePartialProgress(partial, "flashcards", "free", readPrePartialProgress("flashcards", "free"))).toMatchObject({ total: 150, done: 2, new: 148, incorrect: 1 })
    expect(countPrePartialProgress(partial, "flashcards", "fsrs", readPrePartialProgress("flashcards", "fsrs"))).toMatchObject({ total: 150, done: 1, new: 149, incorrect: 0 })
  })

  it("recuerda Nuevas por parcial y tipo al regresar o recargar, sin cambiar los otros filtros", () => {
    savePrePartialPreference(partial.id, "questions", "new")
    savePrePartialPreference("otro", "questions", "incorrect")
    savePrePartialPreference(partial.id, "flashcards", "mixed")
    expect(loadPrePartialPreferences()).toEqual({
      [prePartialPreferenceKey(partial.id, "questions")]: "new",
      [prePartialPreferenceKey("otro", "questions")]: "incorrect",
      [prePartialPreferenceKey(partial.id, "flashcards")]: "mixed",
    })
    localStorage.setItem(PREPARTIAL_PREFERENCES_KEY, '{"invalido":"random"}')
    expect(loadPrePartialPreferences()).toEqual({})
  })

  it("muestra progreso parcial y final y restaura la selección visible en el menú compartido por app y Builder", () => {
    recordQuestionAnswer(partial.questions[0], true)
    savePrePartialPreference(partial.id, "questions", "new")
    const html = renderToStaticMarkup(createElement(PrePartialReviewScreen, {
      initialReviewType: "Opción múltiple", initialSubject: "Histología",
      onBack() {}, onMainMenu() {}, onStartMultipleChoice() {}, onStartFlashcards() {}, onResetPartial() {}, onContinuePartial() {}, onReviewTypeChange() {},
    }))
    expect(html).toContain("1/108 preguntas hechas")
    expect(html).toContain("0/393 preguntas hechas")
    expect(html).toContain("107 nuevas")
    const firstArticle = html.slice(html.indexOf("<article"), html.indexOf("</article>"))
    expect(firstArticle).toMatch(/aria-pressed="true"[^>]*>Nuevas<\/button>/)
    expect(firstArticle).toMatch(/aria-pressed="false"[^>]*>Mezcla<\/button>/)
  })

  it("notifica cambios de esta pestaña, otras pestañas y al volver a enfocarla", () => {
    const target = new EventTarget()
    vi.stubGlobal("window", target)
    try {
      const refresh = vi.fn()
      const stop = subscribeStudyProgress(["odontoma_stats"], refresh)
      notifyStudyProgress("otro")
      expect(refresh).not.toHaveBeenCalled()
      recordQuestionAnswer(partial.questions[0], true)
      expect(refresh).toHaveBeenCalledTimes(1)
      target.dispatchEvent(Object.assign(new Event("storage"), { key: "odontoma_stats" }))
      target.dispatchEvent(new Event("focus"))
      expect(refresh).toHaveBeenCalledTimes(3)
      stop()
      notifyStudyProgress("odontoma_stats")
      expect(refresh).toHaveBeenCalledTimes(3)
    } finally { vi.unstubAllGlobals() }
  })
})

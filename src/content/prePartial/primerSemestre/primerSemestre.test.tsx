import { beforeEach, describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { citoIFirstSemesterBanks, citoIRegularBanks, CITO_I_SUBJECT } from "./index"
import { getCumulativePrePartialBank, getPrePartialBank } from "../banks"
import { selectPrePartialQuestions } from "../cumulative"
import { studioBanks, compactStudioData, resolveStudioBanks } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { reviewClassPresentation } from "@/content/appBuilder/organization"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"
import { installLocalStorageMock } from "@/test/localStorageMock"
import { loadStats, recordQuestionAnswer, resetQuestionBankStats } from "@/lib/stats"
import PrePartialReviewScreen from "@/components/PrePartialReviewScreen"

const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")
const questions = citoIFirstSemesterBanks.flatMap(b => b.questions)
const cards = citoIFirstSemesterBanks.flatMap(b => b.flashcards)

describe("Cito I · repasos del primer semestre", () => {
  beforeEach(installLocalStorageMock)

  it("registra cuatro parciales y recuperación independiente en el catálogo app/Builder", () => {
    expect(citoIFirstSemesterBanks.map(b => [b.questions.length, b.flashcards.length])).toEqual([[90, 90], [94, 92], [86, 84], [96, 96], [30, 40]])
    expect(questions).toHaveLength(396)
    expect(cards).toHaveLength(402)
    for (const bank of citoIRegularBanks) {
      expect(bank.questions.length).toBeGreaterThanOrEqual(80)
      expect(bank.questions.length).toBeLessThanOrEqual(100)
      expect(bank.flashcards.length).toBeGreaterThanOrEqual(80)
      expect(bank.flashcards.length).toBeLessThanOrEqual(100)
    }
    expect(validateStudio({ version: 1, banks: citoIFirstSemesterBanks })).toEqual([])
    for (const bank of citoIFirstSemesterBanks) {
      expect(bank.subject).toBe(CITO_I_SUBJECT)
      expect(bank.kind).toBe("prepartial")
      expect(getPrePartialBank(bank.id)).toEqual(bank)
      expect(studioBanks.filter(b => b.id === bank.id)).toHaveLength(1)
    }
  })

  it("mantiene final Cito I separado de Cito II y excluye recuperación muscular", () => {
    const finalI = getCumulativePrePartialBank(CITO_I_SUBJECT)!
    const finalII = getCumulativePrePartialBank("Histología")!
    expect(finalI.title).toBe("Examen final · Cito I")
    expect(finalI.questions).toHaveLength(366)
    expect(finalII.title).toBe("Examen final · Cito II")
    expect(finalII.questions).toHaveLength(393)
    expect(finalI.chapters.map(c => c.id)).toEqual(citoIRegularBanks.map(b => b.id))
    expect(finalI.questions.some(q => /muscular/.test(q.chapter))).toBe(false)
    expect(finalI.id).not.toBe(finalII.id)
    expect(reviewClassPresentation("Histología").title).toBe("Citohistología II")
  })

  it("mantiene identificadores independientes y evita copiar enunciados del banco normal", () => {
    const ours = new Set(citoIFirstSemesterBanks.map(b => b.id))
    const others = studioBanks.filter(b => !ours.has(b.id))
    const oldIds = new Set(others.flatMap(b => [...b.questions, ...b.flashcards].map(i => i.id)))
    const oldStems = new Set(others.flatMap(b => b.questions.map(q => normalize(q.question))))
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length)
    expect(new Set(cards.map(c => c.id)).size).toBe(cards.length)
    for (const item of [...questions, ...cards]) expect(oldIds.has(item.id), item.id).toBe(false)
    for (const q of questions) expect(oldStems.has(normalize(q.question)), q.question).toBe(false)
  })

  it("ofrece distractores individuales y V/F equilibradas con explicaciones separadas", () => {
    for (const bank of citoIFirstSemesterBanks) {
      expect(new Set(bank.questions.map(q => normalize(q.question))).size).toBe(bank.questions.length)
      const vf = bank.questions.filter(q => q.options.length === 2)
      expect(vf.filter(q => q.correctAnswers[0] === 0).length).toBe(vf.length / 2)
      for (const q of bank.questions) {
        expect(q.correctAnswers).toHaveLength(1)
        expect(new Set(q.options.map(normalize)).size).toBe(q.options.length)
        expect(q.explanation.length).toBeGreaterThan(40)
        expect(q.question).not.toMatch(/según (el examen|los apuntes|el libro)/i)
        if (q.options.length === 2) expect(q.options).toEqual(["Verdadero", "Falso"])
        else {
          expect(q.options).toHaveLength(4)
          expect(q.options.join(" ")).not.toMatch(/todas (son|las anteriores)|ninguna de las anteriores/i)
          const key = q.options[q.correctAnswers[0]].length
          const distractors = q.options.filter((_, i) => i !== q.correctAnswers[0]).map(o => o.length)
          // Fixed technical names naturally differ (eucromatina/heterocromatina).
          // The length net targets explanatory phrases, not names or numerals.
          if (Math.max(...q.options.map(o => o.length)) > 55) {
            expect(key, q.question).toBeLessThanOrEqual(Math.max(...distractors) * 1.8)
            expect(key, q.question).toBeGreaterThanOrEqual(Math.min(...distractors) * 0.45)
          }
        }
      }
    }
  })

  it("usa tarjetas directas y concretas, no afirmaciones V/F ni listas gigantes", () => {
    for (const bank of citoIFirstSemesterBanks) {
      expect(new Set(bank.flashcards.map(c => normalize(c.front))).size).toBe(bank.flashcards.length)
      for (const c of bank.flashcards) {
        expect(c.front).toMatch(/^¿.+\?$/)
        expect(c.front).not.toMatch(/verdadero o falso|según los apuntes|mencione cosas|en esto.*qué es/i)
        expect(c.back).not.toMatch(/^(verdadero|falso)\b/i)
        expect(c.back.length, c.front).toBeLessThan(240)
        expect(c.topic).toBeTruthy()
        expect(c.chapter).toBe(bank.id)
      }
    }
  })

  it("no hace que la alternativa correcta sea sistemáticamente la más larga", () => {
    for (const bank of citoIRegularBanks) {
      const mc = bank.questions.filter(q => q.options.length === 4)
      const longest = mc.filter(q => q.options[q.correctAnswers[0]].length > Math.max(...q.options.filter((_, i) => i !== q.correctAnswers[0]).map(o => o.length)))
      expect(longest.length / mc.length, `${bank.title}: ${longest.length}/${mc.length} claves son únicas más largas`).toBeLessThan(0.6)
    }
  })

  it("amplía cobertura sin renumerar ni retirar las filas de la primera entrega", () => {
    const addedGroups = [/(tecnicas-aplicadas|control-celular)-/, /(polaridad-funcion|glandulas|matriz-integrada|reparacion-integrada)-/, /(cartilago-integrado|hueso-integrado|crecimiento-integrado)-/, /(adiposo-integrado|sangre-integrada|medula-integrada|nervioso-integrado)-/]
    for (const [i, bank] of citoIRegularBanks.entries()) {
      expect(bank.questions.filter(q => !addedGroups[i].test(q.id))).toHaveLength([64, 48, 44, 58][i])
      expect(bank.flashcards.filter(c => !addedGroups[i].test(c.id))).toHaveLength([80, 58, 52, 66][i])
    }
  })

  it("conserva claves después de barajar las letras y no duplica dentro de una tanda", () => {
    for (const bank of citoIFirstSemesterBanks) {
      const keys = new Map(bank.questions.map(q => [q.id, q.options[q.correctAnswers[0]]]))
      const selected = shuffleQuestionsBalanced(selectPrePartialQuestions(bank, 20, "mixed"))
      expect(new Set(selected.map(q => q.id)).size).toBe(selected.length)
      for (const q of selected) expect(q.options[q.correctAnswers[0]]).toBe(keys.get(q.id))
    }
  })

  it("guarda y reinicia progreso solo del parcial elegido sin tocar segundo semestre", () => {
    const a = citoIRegularBanks[0].questions[0]
    const b = getPrePartialBank("Parcial 1 · Cito II")!.questions[0]
    recordQuestionAnswer(a, true)
    recordQuestionAnswer(b, false)
    expect(selectPrePartialQuestions(citoIRegularBanks[0], 200, "new", loadStats().questions).some(q => q.id === a.id)).toBe(false)
    resetQuestionBankStats(citoIRegularBanks[0].questions)
    expect(loadStats().questions[b.id].incorrect).toBe(1)
    expect(loadStats().questions[a.id]).toBeUndefined()
  })

  it("permite editar, compactar y restaurar preguntas y tarjetas desde el Builder", () => {
    const original = structuredClone(studioBanks)
    const edited = structuredClone(studioBanks)
    const selected = edited.find(b => b.id === citoIRegularBanks[0].id)!
    selected.questions[0].explanation = "Explicación modificada por el dueño."
    selected.flashcards[0].back = "Respuesta modificada por el dueño."
    const restored = resolveStudioBanks(compactStudioData({ version: 1, banks: edited }))
    expect(restored.find(b => b.id === selected.id)).toEqual(selected)
    expect(restored.filter(b => b.subject === "Histología")).toEqual(original.filter(b => b.subject === "Histología"))
  })

  it("muestra ambos semestres y títulos breves como en Cito II sin cambiar las claves de progreso", () => {
    const props = { onBack() {}, onMainMenu() {}, onStartMultipleChoice() {}, onStartFlashcards() {}, onResetPartial() {}, onContinuePartial() {}, onReviewTypeChange() {} }
    const menu = renderToStaticMarkup(createElement(PrePartialReviewScreen, props))
    expect(menu).toContain("Citohistología I")
    expect(menu).toContain("Citohistología II")
    const citoI = renderToStaticMarkup(createElement(PrePartialReviewScreen, { ...props, initialReviewType: "Opción múltiple", initialSubject: CITO_I_SUBJECT }))
    expect(citoI).toContain(">Muscular</h2>")
    expect(citoI).not.toMatch(/Ross|Recuperación|Examen adicional/)
    expect(citoIFirstSemesterBanks.at(-1)?.id).toBe("Recuperación muscular · Cito I")
    expect(citoI).toContain("Examen final · Cito I")
    expect(citoI).not.toContain("Examen final · Cito II")
  })

  it("no perpetúa claves erróneas de los apuntes y deja los artículos a nivel general", () => {
    const keyed = (pattern: RegExp) => questions.find(q => pattern.test(q.question))!
    expect(keyed(/osteocito libera FGF23/).options[0]).toMatch(/excreción de fosfato/)
    expect(keyed(/menos plaquetas/).options[0]).toBe("Trombocitopenia.")
    expect(keyed(/unidad motora esquelética/).options[0]).toMatch(/todas las fibras/)
    expect(questions.filter(q => /Artículos/.test(q.topic))).toHaveLength(10)
    expect(questions.map(q => q.question).join(" ")).not.toMatch(/rs2228226|1100Q|GLI1/)
  })
})

import { describe, expect, it } from "vitest"
import { registerNewCourseCards } from "./menuRegistration"
import type { HomeContent } from "../appBuilder/types"
import type { StudyBank } from "./schema"

const home: HomeContent = { mainMenu: { eyebrow: "", title: "", cards: [] }, quizMenu: { eyebrow: "", title: "", subtitle: "", toolsLabel: "", cards: [] }, subjects: [] }
const bank: StudyBank = { id: "farmacologia", title: "Farmacología", subject: "Farmacología", kind: "course", chapters: [], questions: [], flashcards: [] }
describe("registro de tarjetas solo al crear un banco", () => {
  it("registra una materia nueva una sola vez", () => {
    const first = registerNewCourseCards(home, [], new Set(), [bank])
    expect(first.home.subjects).toHaveLength(1)
    expect(first.decks).toHaveLength(1)
    expect(registerNewCourseCards(first.home, first.decks, new Set(), [bank])).toEqual(first)
    expect(home.subjects).toEqual([])
  })
  it("no vuelve a crear una tarjeta quitada aunque el banco siga existiendo", () => {
    const savedAfterRemoval = registerNewCourseCards(home, [], new Set([bank.id]), [bank])
    expect(savedAfterRemoval.home.subjects).toEqual([])
    expect(savedAfterRemoval.decks).toEqual([])
    expect(bank.questions).toEqual([])
  })
  it("conserva las tarjetas quitadas recuperables y no registra repasos como materias normales", () => {
    const first = registerNewCourseCards(home, [], new Set(), [bank])
    first.home.subjects[0].hidden = true
    first.decks[0].hidden = true
    expect(registerNewCourseCards(first.home, first.decks, new Set([bank.id]), [bank])).toEqual(first)
    expect(registerNewCourseCards(home, [], new Set(), [{ ...bank, kind: "prepartial" }]).decks).toEqual([])
  })
})

import { expect, it } from "vitest"
import { GlobalJournal } from "./globalHistory"
it("deshace y rehace cronológicamente entre editores, incluso cinco veces", () => {
  const journal = new GlobalJournal(), state = { library: 0, home: 0 }
  for (let i = 1; i <= 6; i++) {
    const area = i % 2 ? "library" : "home", before = state[area]
    state[area] = i
    journal.record({ area, before, after: i, apply: v => { state[area] = Number(v) } }, area)
  }
  for (let i = 0; i < 5; i++) journal.undo()
  expect(state).toEqual({ library: 1, home: 0 })
  for (let i = 0; i < 5; i++) journal.redo()
  expect(state).toEqual({ library: 5, home: 6 })
  journal.undo()
  journal.record({ area: "home", before: state.home, after: 10, apply: v => { state.home = Number(v) } }, "home")
  expect(journal.getSnapshot().canRedo).toBe(false)
})
it("una creación compuesta se deshace completa y una recarga invalida su historial", () => {
  const journal = new GlobalJournal(), state = { a: 0, b: 0 }
  journal.batch("Crear materia y accesos", () => {
    for (const area of ["a", "b", "b"] as const) {
      const before = state[area]; state[area]++
      journal.record({ area, before, after: state[area], apply: v => { state[area] = Number(v) } }, area)
    }
  })
  expect(state).toEqual({ a: 1, b: 2 })
  journal.undo(); expect(state).toEqual({ a: 0, b: 0 })
  journal.redo(); expect(state).toEqual({ a: 1, b: 2 })
  journal.forget("a"); expect(journal.getSnapshot().canUndo).toBe(false)
})
it("agrupa escritura continua en un campo, pero no ediciones en campos distintos", () => {
  const journal = new GlobalJournal(), field = {}, other = {}
  let value = ""
  for (const [text, time] of [["A", 1000], ["AB", 1100], ["ABC", 1200]] as const) {
    const before = value; value = text
    journal.record({ area: "home", before, after: text, apply: v => { value = String(v) } }, "Título", field, time)
  }
  journal.undo(); expect(value).toBe("")
  journal.redo(); expect(value).toBe("ABC")
  journal.record({ area: "home", before: value, after: "Otro campo", apply: v => { value = String(v) } }, "Descripción", other, 1300)
  journal.undo(); expect(value).toBe("ABC")
})

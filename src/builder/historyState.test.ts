import { describe, expect, it } from "vitest"
import { editHistory, type EditHistory } from "./historyState"
describe("Deshacer/Rehacer del builder", () => {
  it("recorre cinco ediciones en orden y permite rehacerlas", () => {
    let state: EditHistory<number> = { present: 0, past: [], future: [], revision: 0 }
    for (let i = 1; i <= 5; i++) state = editHistory(state, { type: "set", next: i })
    for (let i = 4; i >= 0; i--) { state = editHistory(state, { type: "undo" }); expect(state.present).toBe(i) }
    for (let i = 1; i <= 5; i++) { state = editHistory(state, { type: "redo" }); expect(state.present).toBe(i) }
  })
  it("es puro ante invocaciones repetidas y corta la rama al volver a editar", () => {
    const initial: EditHistory<string> = { present: "A", past: [], future: [], revision: 0 }
    expect(editHistory(initial, { type: "set", next: "B" })).toEqual(editHistory(initial, { type: "set", next: "B" }))
    expect(initial.past).toEqual([])
    const next = editHistory(editHistory(editHistory(initial, { type: "set", next: "B" }), { type: "undo" }), { type: "set", next: "C" })
    expect(next.future).toEqual([])
    expect(editHistory(next, { type: "reset", next: "D" }).past).toEqual([])
  })
})

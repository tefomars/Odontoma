import { describe, expect, it } from "vitest"
import { describeChanges, historyDate, localHistoryDate, projectCounts, type ProjectSnapshot } from "./projectHistory"
describe("historial legible", () => {
  const before: ProjectSnapshot = { app: "Odontoma Project", version: 1, files: { library: { banks: [{ id: "bio", title: "Bioquímica", questions: [], flashcards: [] }] }, pages: [], written: { decks: [] } } }
  it("identifica cambios y cuenta sin incluir materias quitadas", () => {
    const after = structuredClone(before)
    after.files.pages = [{ id: "menu" }]
    after.files.library = { banks: [{ id: "bio", title: "Bioquímica", archived: true, questions: [], flashcards: [] }] }
    expect(describeChanges(before, after)).toEqual(["Materia quitada: Bioquímica", "Pantallas personalizadas"])
    expect(projectCounts(after)).toMatchObject({ banks: 0, pages: 1 })
  })
  it("interpreta el orden ISO y muestra la hora local de Guatemala", () => {
    expect(historyDate("project-2026-11-01T14_33_09.416Z.json")).toBe("2026-11-01T14:33:09.416Z")
    expect(localHistoryDate("2026-11-01T14:33:09.416Z")).toContain("8:33:09")
    expect(describeChanges(before, structuredClone(before))).toEqual(["Sin diferencias en el contenido editable"])
  })
})

import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { draftValuesEqual } from "./draftEquality"
import { publishIndex } from "./workspaceBridge"

afterEach(() => vi.unstubAllGlobals())

describe("escritura fluida sin retrasar el contenido del borrador", () => {
  it("compara contenido JSON, detecta cambios y reconoce Deshacer hasta el original", () => {
    const saved = { classes: [], decks: [{ id: "deck", questions: [{ id: "q", modelAnswer: "Respuesta", acceptedPoints: ["Dos palabras"], backImage: "/media/a.png" }] }] }
    expect(draftValuesEqual(saved, structuredClone(saved))).toBe(true)
    const changed = { ...saved, decks: [{ ...saved.decks[0], questions: [{ ...saved.decks[0].questions[0], modelAnswer: "Respuesta nueva" }] }] }
    expect(draftValuesEqual(changed, saved)).toBe(false)
    expect(draftValuesEqual({ ...changed, decks: saved.decks }, saved)).toBe(true)
    const removed = { ...saved, decks: [] }
    expect(draftValuesEqual(removed, saved)).toBe(false)
    expect(draftValuesEqual([1, 2], [2, 1])).toBe(false)
    expect(draftValuesEqual([1], { 0: 1 })).toBe(false)
    expect(draftValuesEqual([1], [1, 2])).toBe(false)
    expect(draftValuesEqual(null, {})).toBe(false)
  })

  it("conserva la semántica de campos opcionales y no confunde huecos con valores", () => {
    expect(draftValuesEqual({ name: "Quiz", categoryId: undefined }, { name: "Quiz" })).toBe(true)
    expect(draftValuesEqual({ categoryId: null }, {})).toBe(false)
    expect(draftValuesEqual({ name: "A", count: 1 }, { count: 1, name: "A" })).toBe(true)
    expect(draftValuesEqual(new Array(1), [1])).toBe(false)
    expect(draftValuesEqual([undefined], [null])).toBe(true)
    expect(draftValuesEqual({ q: "A" }, { other: "A" })).toBe(false)
  })

  it("no recorre miles de tarjetas que conservan la misma referencia", () => {
    let reads = 0
    const shared = { get cards() { reads++; return Array.from({ length: 12000 }, (_, i) => ({ id: i })) } }
    expect(draftValuesEqual({ untouched: shared, title: "A" }, { untouched: shared, title: "B" })).toBe(false)
    expect(reads).toBe(0)
  })

  it("publica el árbol solo cuando cambian metadatos, orden o cantidades", () => {
    const dispatchEvent = vi.fn()
    vi.stubGlobal("window", { dispatchEvent })
    const area = "typing-test-index"
    const items = [{ id: "d", title: "Quiz", questions: 20, categoryId: "year" }]
    publishIndex(area, items)
    for (let i = 0; i < 100; i++) publishIndex(area, structuredClone(items))
    expect(dispatchEvent).toHaveBeenCalledTimes(1)
    publishIndex(area, [{ ...items[0], title: "Nuevo nombre" }])
    expect(dispatchEvent).toHaveBeenCalledTimes(2)
    publishIndex(area, [{ ...items[0], questions: 21 }])
    expect(dispatchEvent).toHaveBeenCalledTimes(3)
    publishIndex(area, [...items, { ...items[0], id: "d2" }])
    publishIndex(area, [{ ...items[0], id: "d2" }, ...items])
    expect(dispatchEvent).toHaveBeenCalledTimes(5)
  })

  it("aísla paneles sin desmontarlos y conserva validaciones en cambios reales", () => {
    const workspace = readFileSync(new URL("./StudioWorkspace.tsx", import.meta.url), "utf8")
    const library = readFileSync(new URL("./LibraryEditor.tsx", import.meta.url), "utf8")
    const written = readFileSync(new URL("./OpenQuizContentEditor.tsx", import.meta.url), "utf8")
    expect(workspace).toContain("memo(LibraryEditor)")
    expect(workspace).toContain("memo(OpenQuizContentEditor)")
    expect(workspace).toContain('<div hidden={target.panel !== "written"}><StableWrittenEditor')
    expect(library).toContain("useMemo(() => loaded ? validateStudio(history.state)")
    expect(library).toContain("useMemo(() => conflict ? libraryChanges(")
    expect(written).toContain("detail.files.written = content")
    expect(library).toContain("detail.writes.push(draft(history.state, baseRevision))")
  })
})

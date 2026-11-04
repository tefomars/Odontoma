import { describe, expect, it } from "vitest"
import home from "./subjects.json"
import decks from "./flashcard-subjects.json"
import pages from "./custom-pages.json"
import { validateNavigation, type NavigationProject } from "./navigationValidation"
import { studioBanks } from "../studio/catalog"

function fixture(): NavigationProject {
  return { home: structuredClone(home) as NavigationProject["home"], decks: structuredClone(decks) as NavigationProject["decks"], pages: structuredClone(pages) as NavigationProject["pages"], banks: studioBanks }
}
describe("enlaces editables", () => {
  it("acepta los accesos actuales y sus destinos heredados", () => {
    expect(validateNavigation(fixture()).filter(i => i.severity === "error")).toEqual([])
  })
  it("señala el botón exacto cuyo menú ya no existe", () => {
    const p = fixture()
    p.pages = [{ id: "menu", title: "Menú", blocks: [{ id: "link", type: "button", title: "Abrir", destination: "custom-page:eliminado" }] }]
    expect(validateNavigation(p)).toContainEqual(expect.objectContaining({ severity: "error", target: { panel: "pages", id: "menu", blockId: "link" } }))
  })
  it("permite menús sin accesos y avisa de autoenlaces sin bloquear", () => {
    const p = fixture()
    p.pages.push({ id: "menu", title: "Menú", blocks: [] })
    expect(validateNavigation(p).filter(i => i.severity === "error")).toEqual([])
    p.pages.at(-1)!.blocks.push({ id: "self", type: "button", destination: "custom-page:menu" })
    expect(validateNavigation(p)).toContainEqual(expect.objectContaining({ severity: "warning" }))
  })
  it("detecta bancos ausentes e ignora tarjetas de acceso quitadas", () => {
    const p = fixture()
    p.home.subjects[0].destination = "bank:ausente"
    expect(validateNavigation(p).some(i => i.severity === "error")).toBe(true)
    p.home.subjects[0].hidden = true
    expect(validateNavigation(p).filter(i => i.severity === "error")).toEqual([])
  })
  it("avisa si el banco destino está archivado", () => {
    const p = fixture()
    p.banks = p.banks.map(b => ({ ...b, archived: true }))
    expect(validateNavigation(p).some(i => i.severity === "warning" && i.message.includes("archivado"))).toBe(true)
    expect(validateNavigation(p).filter(i => i.severity === "error")).toEqual([])
  })
})

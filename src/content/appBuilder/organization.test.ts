import { describe, expect, it } from "vitest"
import { subjectSections, validateOrganization, reviewClassPresentation, type Organization } from "./organization"
const config: Organization = { version: 1, quizzes: [{ id: "primary", title: "Principales", description: "", color: "#123456" }, { id: "electivas", title: "Electivas", description: "", color: "#abcdef" }], flashcards: [{ id: "primary", title: "Materias", description: "", color: "#123456" }] }
describe("subdivisiones editables", () => {
  it("permite agregar, renombrar y reordenar sin perder materias", () => {
    const items = [{ destination: "bank:uno", sectionId: "electivas" }, { destination: "histologia" }, { destination: "bank:otro", sectionId: "quitada" }]
    const groups = subjectSections(items, [...config.quizzes].reverse())
    expect(groups[0].id).toBe("electivas")
    expect(groups[0].items).toEqual([items[0], items[2]])
    expect(groups.flatMap(g => g.items)).toHaveLength(3)
    expect(validateOrganization(config)).toBe(true)
  })
  it("rechaza grupos duplicados, vacíos o sin nombre", () => {
    expect(validateOrganization({ ...config, quizzes: [] })).toBe(false)
    expect(validateOrganization({ ...config, quizzes: [...config.quizzes, config.quizzes[0]] })).toBe(false)
    expect(validateOrganization({ ...config, quizzes: [{ ...config.quizzes[0], title: "" }] })).toBe(false)
  })
  it("oculta tarjetas quitadas y conserva las demás en su grupo", () => {
    const groups = subjectSections([{ destination: "bank:farmaco", hidden: true }, { destination: "histologia" }], config.quizzes)
    expect(groups.flatMap(g => g.items).map(s => s.destination)).toEqual(["histologia"])
  })
  it("renombra solo la presentación de la clase de repaso, no su clave estable", () => {
    const edited: Organization = { ...config, reviewClasses: { Histología: { title: "Cito II · repaso", color: "#123456" } } }
    expect(reviewClassPresentation("Histología", edited).title).toBe("Cito II · repaso")
    expect(Object.keys(edited.reviewClasses!)).toEqual(["Histología"])
    expect(reviewClassPresentation("Histología", config).title).toBe("Citohistología")
    expect(validateOrganization(edited)).toBe(true)
    expect(validateOrganization({ ...edited, reviewClasses: { Histología: { title: "" } } })).toBe(false)
  })
  it("permite configurar el final desde Builder manteniendo compatibilidad con proyectos previos", () => {
    expect(reviewClassPresentation("Histología", config).finalExamEnabled).toBe(true)
    expect(reviewClassPresentation("Histología", config).finalExamTitle).toBe("Examen final")
    const edited: Organization = { ...config, reviewClasses: { Histología: { title: "Cito", finalExamEnabled: false, finalExamTitle: "Simulacro anual" } } }
    expect(validateOrganization(edited)).toBe(true)
    expect(reviewClassPresentation("Histología", edited).finalExamEnabled).toBe(false)
    expect(reviewClassPresentation("Histología", edited).finalExamTitle).toBe("Simulacro anual")
    expect(validateOrganization({ ...edited, reviewClasses: { Histología: { title: "Cito", finalExamEnabled: "false" } } })).toBe(false)
    expect(validateOrganization({ ...edited, reviewClasses: { Histología: { title: "Cito", finalExamTitle: " " } } })).toBe(false)
  })
})

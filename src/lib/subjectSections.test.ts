import { describe, expect, it } from "vitest"

import { groupSubjectSections } from "./subjectSections"

// Fixtures: editing content in the builder must not invalidate grouping tests.
const subjects = (...destinations: string[]) => destinations.map(destination => ({ destination }))

describe("secciones de materias", () => {
  it("ubica Hayek debajo de las materias principales en Quizzes", () => {
    const sections = groupSubjectSections(subjects("histologia", "microbiologia", "bioquimica", "semiologia", "filosofia-de-hayek"))
    expect(sections.primary.map(subject => subject.destination)).toEqual([
      "histologia", "microbiologia", "bioquimica", "semiologia"
    ])
    expect(sections.secondary.map(subject => subject.destination)).toEqual(["filosofia-de-hayek"])
  })

  it("separa Hayek y Proceso Económico en Flashcards sin ocultar próximos bloques", () => {
    const sections = groupSubjectSections(subjects("histologia", "semiologia", "bioquimica", "proceso-economico-i", "filosofia-de-hayek", "coming-soon", "coming-soon"))
    expect(sections.primary.map(subject => subject.destination)).toEqual([
      "histologia", "semiologia", "bioquimica"
    ])
    expect(sections.secondary.map(subject => subject.destination)).toEqual([
      "proceso-economico-i", "filosofia-de-hayek"
    ])
    expect(sections.upcoming).toHaveLength(2)
  })

  it("incluye materias nuevas sin perderlas ni contarlas como próximas", () => {
    const sections = groupSubjectSections(subjects("histologia", "bank:nueva-materia", "filosofia-de-hayek"))
    expect(sections.primary.map(s => s.destination)).toEqual(["histologia", "bank:nueva-materia"])
    expect(sections.secondary.map(s => s.destination)).toEqual(["filosofia-de-hayek"])
  })
})

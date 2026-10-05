import { describe, expect, it } from "vitest"

import { homeSubjects } from "@/content/appBuilder"
import { flashcardSubjectBlocks } from "@/content/appBuilder/flashcardSubjects"
import { groupSubjectSections } from "./subjectSections"

describe("secciones de materias", () => {
  it("ubica Hayek debajo de las materias principales en Quizzes", () => {
    const sections = groupSubjectSections(homeSubjects)
    expect(sections.primary.map(subject => subject.destination)).toEqual([
      "histologia", "microbiologia", "bioquimica", "semiologia"
    ])
    expect(sections.secondary.map(subject => subject.destination)).toEqual(["filosofia-de-hayek"])
  })

  it("separa Hayek y Proceso Económico en Flashcards sin ocultar próximos bloques", () => {
    const sections = groupSubjectSections(flashcardSubjectBlocks)
    expect(sections.primary.map(subject => subject.destination)).toEqual([
      "histologia", "semiologia", "bioquimica"
    ])
    expect(sections.secondary.map(subject => subject.destination)).toEqual([
      "proceso-economico-i", "filosofia-de-hayek"
    ])
    expect(sections.upcoming).toHaveLength(2)
  })
})

import { describe, expect, it } from "vitest"
import { chapterEyebrow } from "./studyLabels"

describe("etiquetas visibles de capítulos", () => {
  it("no expone las claves generadas por el builder", () => {
    expect(chapterEyebrow({ id: "chapter-d5e3060b-9c7f-4b44-b08a-5928f98d0794", title: "Bloque 1" })).toBe("Capítulo")
    expect(chapterEyebrow({ id: "d5e3060b-9c7f-4b44-b08a-5928f98d0794", title: "Bloque 1" })).toBe("Capítulo")
  })
  it("conserva etiquetas explícitas y nombres históricos legibles", () => {
    expect(chapterEyebrow({ id: "Capítulo 15", title: "Piel" })).toBe("Capítulo 15")
    expect(chapterEyebrow({ id: "chapter-123", title: "Piel", eyebrow: "Parcial 2" })).toBe("Parcial 2")
    expect(chapterEyebrow({ id: "Artículo", title: "Artículo" })).toBe("")
  })
})
import { chapterDisplayName } from "./studyLabels"
it("usa el título humano del capítulo nuevo dentro del quiz", () => {
  expect(chapterDisplayName({ id: "chapter-a6dca6b0", title: "Capítulo de prueba" })).toBe("Capítulo de prueba")
  expect(chapterDisplayName({ id: "17", title: "Tubo digestivo" })).toBe("17 · Tubo digestivo")
})

import { describe, expect, it } from "vitest"
import { chapterEyebrow, flashcardChapterLabel, flashcardTopicLabel } from "./studyLabels"

describe("etiquetas visibles de capítulos", () => {
  it("muestra el título editable del preparcial sin exponer su clave histórica", () => {
    const card = { chapter: "Recuperación muscular · Cito I" }
    expect(flashcardChapterLabel(card, [], { kind: "prepartial", title: "Muscular" })).toBe("Muscular")
    expect(flashcardChapterLabel(card, [], { kind: "prepartial", title: "Mi bloque muscular" })).toBe("Mi bloque muscular")
    expect(card.chapter).toBe("Recuperación muscular · Cito I")
  })
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

describe("etiquetas de flashcards personales", () => {
  const id = "topic-1793655178704-d6b27a37-54a7-41be-81a6-fe8ba88953ff"
  it("muestra el nombre actual del mazo, no su ID ni un nombre antiguo", () => {
    expect(flashcardTopicLabel({ topic: id, chapter: "Nombre antiguo" }, "user", [{ id, name: "Respiratorio" }])).toBe("Respiratorio")
  })
  it("usa el nombre conservado en importaciones antiguas o una etiqueta neutral", () => {
    expect(flashcardTopicLabel({ topic: id, chapter: "Respiratorio" }, "user")).toBe("Respiratorio")
    expect(flashcardTopicLabel({ topic: id, chapter: id }, "user")).toBe("Mis flashcards")
    expect(flashcardTopicLabel({ topic: id, chapter: "" }, "user")).toBe("Mis flashcards")
  })
  it("conserva los temas de tarjetas oficiales y no modifica el contenido", () => {
    const card = { topic: "Alvéolos", chapter: "Capítulo 19" }
    expect(flashcardTopicLabel(card, "default")).toBe("Alvéolos")
    expect(card).toEqual({ topic: "Alvéolos", chapter: "Capítulo 19" })
  })
})

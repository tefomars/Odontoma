import { describe, expect, it } from "vitest"
import savedContent from "./data.json"
import type { OpenQuizContent } from "./types"
import { normalizeWrittenForSave, validateWrittenContent } from "./validation"

const content = (): OpenQuizContent => ({
  classes: [{ id: "class", name: "Materiales dentales", symbol: "🪥", color: "#fbbf24" }],
  decks: [{ id: "deck", title: "Ionómeros de vidrio", subject: "Materiales dentales", partial: 2,
    questions: [{ id: "question", prompt: "Pregunta", modelAnswer: "Respuesta", acceptedPoints: [] }] }]
})

describe("validación de escritas al guardar el proyecto", () => {
  it("acepta el contenido oficial actual sin modificarlo", () => {
    expect(validateWrittenContent(savedContent)).toEqual([])
  })
  it("no confunde líneas vacías de edición con criterios incompletos", () => {
    const value = content()
    value.decks[0].questions[0].acceptedPoints = ["  dos palabras  ", "", " ", "\n"]
    const before = structuredClone(value)
    expect(validateWrittenContent(value)).toEqual([])
    const normalized = normalizeWrittenForSave(value)
    expect(normalized.decks[0].questions[0].acceptedPoints).toEqual(["dos palabras"])
    expect(normalized.decks[0].questions[0].prompt).toBe("Pregunta")
    expect(normalized.decks[0].questions[0].modelAnswer).toBe("Respuesta")
    expect(value).toEqual(before)
  })
  it("conserva imágenes de ambos lados, identificadores y texto al normalizar", () => {
    const value = content()
    Object.assign(value.decks[0].questions[0], { image: "data:image/webp;base64,UklGRg==", backImage: "/media/answer.png", imageAlt: "Pregunta", backImageAlt: "Respuesta" })
    expect(validateWrittenContent(value)).toEqual([])
    expect(normalizeWrittenForSave(value)).toEqual(value)
  })
  it("señala la pregunta y el campo que impide guardar, sin borrar la pregunta", () => {
    const value = content()
    value.decks[0].questions[0].modelAnswer = ""
    expect(validateWrittenContent(value)).toEqual(["Materiales dentales → Ionómeros de vidrio → Pregunta 1: falta la respuesta modelo o supera 12000 caracteres."])
    expect(value.decks[0].questions).toHaveLength(1)
  })
  it("indica qué imagen falla sin incluir el contenido de la imagen en el error", () => {
    const value = content()
    value.decks[0].questions[0].backImage = "javascript:alert(1)"
    const issues = validateWrittenContent(value)
    expect(issues[0]).toContain("Pregunta 1: Imagen de la respuesta inválida")
    expect(issues[0]).not.toContain("javascript")
  })
  it("sigue rechazando datos inválidos y no los descarta silenciosamente", () => {
    const value = content()
    value.decks[0].questions.push({ ...value.decks[0].questions[0] })
    expect(validateWrittenContent(value)[0]).toContain("identificador de pregunta vacío o repetido")
    expect(validateWrittenContent({ decks: [{ ...content().decks[0], questions: [{ id: "a", prompt: "P", modelAnswer: "R", acceptedPoints: [123] }] }] })[0]).toContain("puntos aceptados")
  })
  it("maneja objetos dañados con un diagnóstico, no con un error interno", () => {
    for (const value of [null, {}, { decks: [null] }, { classes: [{ name: 5 }], decks: [] }, { decks: [{ questions: [null] }] }]) {
      expect(validateWrittenContent(value).length).toBeGreaterThan(0)
    }
  })
  it("acepta clases vacías y cuestionarios todavía sin preguntas", () => {
    const value = content()
    value.decks[0].questions = []
    expect(validateWrittenContent(value)).toEqual([])
    value.decks = []
    expect(validateWrittenContent(value)).toEqual([])
  })
})

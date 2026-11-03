import { describe, expect, it } from "vitest"
import { aiPrompt, formatExample, type ImportKind } from "./contentFormats"
import { analyzeImport, detectColumns, readImport } from "./contentImport"
describe("formatos compartibles e importación", () => {
  for (const kind of ["multiple-choice", "true-false", "written", "flashcards"] as ImportKind[]) it(`acepta el ejemplo y prompt de ${kind}`, () => {
    const value = JSON.stringify(formatExample(kind))
    expect(analyzeImport(readImport(value, kind), kind, []).every(r => r.item && !r.error)).toBe(true)
    expect(aiPrompt(kind)).toContain(value.includes("items") ? '"items"' : "MATERIAL")
    expect(aiPrompt(kind)).toContain("EXCLUSIVAMENTE")
  })
  it("detecta encabezados de Excel, columnas reordenadas y campos con comas", () => {
    const doc = readImport('\uFEFFCorrecta,Pregunta,D,C,B,A,Explicación\nB,"¿Uno, dos?",Cuatro,Tres,Dos,Uno,"Una, explicación"', "multiple-choice")
    const auto = detectColumns(doc.table!, "multiple-choice")
    expect(auto.hasHeader).toBe(true)
    expect(analyzeImport(doc, "multiple-choice", [], auto.mapping, true)[0]).toMatchObject({ row: 2, item: { question: "¿Uno, dos?", options: ["Uno", "Dos", "Tres", "Cuatro"], correctAnswers: [1], explanation: "Una, explicación" } })
  })
  it("admite TSV sin encabezado y CSV de Excel con punto y coma", () => {
    for (const value of ["Frente\tRespuesta\tTema\n¿X?\tY\tZ", "Frente;Respuesta;Subtema\n¿X?;Y;Z"]) {
      const doc = readImport(value, "flashcards"), auto = detectColumns(doc.table!, "flashcards")
      expect(analyzeImport(doc, "flashcards", [], auto.mapping, auto.hasHeader)[0].item?.back).toBe("Y")
    }
    const doc = readImport("¿X?\tY\tZ", "flashcards"), auto = detectColumns(doc.table!, "flashcards")
    expect(auto.hasHeader).toBe(false)
    expect(analyzeImport(doc, "flashcards", [], auto.mapping)[0].item?.subtopic).toBe("Z")
  })
  it("conserva respuestas múltiples, índices heredados y V/F", () => {
    const doc = { records: [{ question: "P", options: ["A", "B", "C"], answer: ["A", "C"] }, { question: "P2", options: ["A", "B"], correctAnswers: [0] }, { question: "P3", answer: false }] }
    expect(analyzeImport(doc, "multiple-choice", []).map(r => r.item?.correctAnswers)).toEqual([[0, 2], [0], [1]])
  })
  it("indica errores por fila y posibles duplicados sin sobrescribir respuestas", () => {
    const rows = analyzeImport({ records: [{ front: "  ¿X? ", back: "Otra respuesta" }, { front: "¿Y?", back: "" }, { front: "¿Z?", back: "Z" }, { front: "¿Z?", back: "Distinta" }] }, "flashcards", ["¿x?"])
    expect(rows.map(r => !!r.duplicate)).toEqual([true, false, false, true])
    expect(rows[1]).toMatchObject({ row: 2, error: "Falta la respuesta." })
    expect(rows[0].item?.back).toBe("Otra respuesta")
  })
  it("rechaza tipos erróneos, opciones repetidas, respuesta inválida e imágenes peligrosas", () => {
    expect(() => readImport(JSON.stringify(formatExample("written")), "flashcards")).toThrow()
    expect(analyzeImport({ records: [{ question: "P", options: ["A", "A"], answer: "A" }, { question: "P2", options: ["A", "B"], answer: "D" }, { front: "F", back: "B", image: "javascript:alert(1)" }] }, "multiple-choice", []).every(r => r.error)).toBe(true)
  })
  it("admite bloques JSON de AI y exportaciones heredadas de escritos", () => {
    const doc = readImport('valid', "written")
    expect(doc.table).toHaveLength(1)
    const old = { questions: [{ prompt: "P", modelAnswer: "R", acceptedPoints: ["A"], explanation: "E" }] }
    expect(analyzeImport(readImport("\u0060\u0060\u0060json\n" + JSON.stringify(old) + "\n\u0060\u0060\u0060", "written"), "written", [])[0].item).toMatchObject({ prompt: "P", modelAnswer: "R", explanation: "E", acceptedPoints: ["A"] })
  })
  it("importa y valida imágenes de pregunta y respuesta de escritos en TSV y JSON", () => {
    const text = 'Pregunta\tRespuesta modelo\tPuntos aceptados\tExplicación\timage\timageAlt\tbackImage\tbackImageAlt\nP\tR\tA\tE\t/media/p.png\tPregunta\t/media/r.png\tSolución'
    const doc = readImport(text, "written"), columns = detectColumns(doc.table!, "written")
    expect(analyzeImport(doc, "written", [], columns.mapping, columns.hasHeader)[0].item).toMatchObject({
      prompt: "P", modelAnswer: "R", image: "/media/p.png", imageAlt: "Pregunta", backImage: "/media/r.png", backImageAlt: "Solución"
    })
    expect(analyzeImport({ records: [{ question: "P", answer: "R", backImage: "javascript:alert(1)" }] }, "written", [])[0].error).toContain("Imagen inválida")
    expect(formatExample("written").items[0]).toHaveProperty("backImage")
  })
})

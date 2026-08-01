import { describe, expect, it } from "vitest"

import {
  articuloHemostasiaFlashcards
} from "./articuloHemostasia"

describe("artículo de hemostasia", () => {
  it("incluye un deck amplio, íntegro y sin tarjetas duplicadas", () => {
    expect(articuloHemostasiaFlashcards).toHaveLength(251)

    const ids =
      new Set(articuloHemostasiaFlashcards.map(card => card.id))

    const fronts =
      new Set(articuloHemostasiaFlashcards.map(card => card.front))

    expect(ids.size).toBe(articuloHemostasiaFlashcards.length)
    expect(fronts.size).toBe(articuloHemostasiaFlashcards.length)

    for (const card of articuloHemostasiaFlashcards) {
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
      expect(card.chapter).toBe("Artículo · Hemostasia y trombosis")
    }
  })

  it("cubre todas las secciones principales del PDF", () => {
    const subtopics =
      new Set(articuloHemostasiaFlashcards.map(card => card.subtopic))

    expect(subtopics).toEqual(new Set([
      "Hemorragia y conceptos generales",
      "Secuencia de la hemostasia normal",
      "Endotelio antitrombótico",
      "Endotelio protrombótico",
      "Plaquetas y gránulos",
      "Adhesión plaquetaria",
      "Activación plaquetaria",
      "Agregación y tapón estable",
      "Interacción plaqueta-endotelio",
      "Cascada de coagulación",
      "Pruebas de coagulación",
      "Trombina y receptores PAR",
      "Anticoagulantes naturales",
      "Fibrinólisis",
      "Trombosis y tríada de Virchow",
      "Flujo anormal y trombosis"
    ]))
  })
})

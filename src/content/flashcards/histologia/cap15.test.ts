import { describe, expect, it } from "vitest"

import { cap15Flashcards } from "./cap15"

describe("flashcards del capítulo 15", () => {
  it("mantiene el deck completo, íntegro y sin duplicados", () => {
    expect(cap15Flashcards).toHaveLength(574)

    const ids = new Set(cap15Flashcards.map(card => card.id))
    const fronts = new Set(cap15Flashcards.map(card => card.front))

    expect(ids.size).toBe(cap15Flashcards.length)
    expect(fronts.size).toBe(cap15Flashcards.length)

    for (const card of cap15Flashcards) {
      expect(card.front.trim()).not.toBe("")
      expect(card.back.trim()).not.toBe("")
      expect(card.chapter).toBe("Capítulo 15")
      expect(card.book).toBe("Ross")
    }
  })

  it("cubre todos los apartados principales del capítulo", () => {
    const subtopics = new Set(cap15Flashcards.map(card => card.subtopic))

    expect(subtopics).toEqual(new Set([
      "Fundamentos tegumentarios",
      "Piel gruesa y delgada",
      "Estratos epidérmicos",
      "Estrato basal",
      "Estrato espinoso",
      "Estrato granuloso",
      "Estratos lúcido y córneo",
      "Unión dermoepidérmica",
      "Dermis papilar y reticular",
      "Hipodermis y músculos cutáneos",
      "Tipos celulares epidérmicos",
      "Diferenciación de queratinocitos",
      "Descamación y gradiente de pH",
      "Cuerpos laminares",
      "Envolturas celular y lipídica",
      "Melanocitos y melanogénesis",
      "Color de la piel",
      "Células de Langerhans",
      "Células de Merkel",
      "Terminaciones nerviosas libres",
      "Receptores encapsulados",
      "Fundamentos de anexos cutáneos",
      "Folículo piloso",
      "Células madre foliculares",
      "Tallo del pelo",
      "Ciclo y tipos de pelo",
      "Glándulas sebáceas",
      "Glándulas sudoríparas ecrinas",
      "Glándulas sudoríparas apocrinas",
      "Placa y aparato ungueal",
      "Cáncer cutáneo",
      "Cirugía de Mohs",
      "Sudoración y enfermedad",
      "Reparación cutánea",
      "Identificación histológica"
    ]))
  })
})

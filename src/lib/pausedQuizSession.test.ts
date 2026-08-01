import { describe, expect, it } from "vitest"

import { refreshPausedQuizQuestions } from "./pausedQuizSession"

describe("refreshPausedQuizQuestions", () => {
  it("mantiene el orden pero reemplaza distractores antiguos", () => {
    const saved = [
      { id: "q2", options: ["respuesta vieja"] },
      { id: "q1", options: ["otra respuesta vieja"] }
    ]
    const current = [
      { id: "q1", options: ["respuesta actual 1"] },
      { id: "q2", options: ["respuesta actual 2"] }
    ]

    expect(refreshPausedQuizQuestions(saved, current)).toEqual([
      current[1],
      current[0]
    ])
  })

  it("descarta preguntas retiradas del banco", () => {
    const saved = [
      { id: "vigente" },
      { id: "retirada" }
    ]
    const current = [{ id: "vigente" }]

    expect(refreshPausedQuizQuestions(saved, current)).toEqual(current)
  })
})

import { describe, expect, it } from "vitest"

import { validateCustomPages } from "./customPageSchema"

describe("custom page schema", () => {
  it("accepts a page assembled from reusable blocks", () => {
    expect(validateCustomPages([{
      id: "recursos",
      eyebrow: "APOYO",
      title: "Recursos",
      description: "Material de estudio",
      accentColor: "#8b5cf6",
      blocks: [
        { id: "heading-1", type: "heading", title: "Primera sección" },
        { id: "button-1", type: "button", title: "Ir a quizzes", destination: "quizzes", accentColor: "#10b981" },
        { id: "button-2", type: "button", title: "Otra pantalla", destination: "custom-page:otra", accentColor: "#f59e0b" }
      ]
    }])).toBe(true)
  })

  it("rejects duplicate block ids and unsafe destinations", () => {
    expect(validateCustomPages([{
      id: "bad",
      eyebrow: "BAD",
      title: "Bad",
      description: "",
      accentColor: "#ffffff",
      blocks: [
        { id: "same", type: "text", text: "Uno" },
        { id: "same", type: "button", title: "Dos", destination: "javascript:alert(1)" }
      ]
    }])).toBe(false)
  })
})

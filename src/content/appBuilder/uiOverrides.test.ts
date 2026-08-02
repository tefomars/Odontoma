import { describe, expect, it } from "vitest"

import { validateUiOverrides } from "./uiOverrideSchema"

describe("universal UI overrides", () => {
  it("accepts a complete visual override", () => {
    expect(validateUiOverrides([{
      id: "heading-home",
      screenKey: "study-method",
      selector: "main > h1",
      label: "Título principal",
      text: "¿Qué querés estudiar?",
      textColor: "#ffffff",
      backgroundColor: "#09090b",
      borderColor: "#27272a",
      borderRadius: 20
    }])).toBe(true)
  })

  it("rejects invalid colors and unsafe radii", () => {
    expect(validateUiOverrides([{
      id: "bad",
      screenKey: "home",
      selector: "main",
      label: "Inválido",
      textColor: "red",
      borderRadius: 999
    }])).toBe(false)
  })
})

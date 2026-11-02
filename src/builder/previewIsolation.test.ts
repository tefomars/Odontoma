import { expect, it } from "vitest"
import { memoryStorage } from "./previewIsolation"
it("mantiene cada sesión de prueba y el progreso real completamente separados", () => {
  const real = memoryStorage(), preview = memoryStorage(), other = memoryStorage()
  real.setItem("progress", "real")
  preview.setItem("progress", "preview")
  expect(real.getItem("progress")).toBe("real")
  expect(other.getItem("progress")).toBeNull()
  preview.clear(); expect(real.length).toBe(1)
  expect(preview.length).toBe(0)
})

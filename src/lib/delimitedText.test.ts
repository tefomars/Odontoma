import { describe, expect, it } from "vitest"

import {
  parseDelimitedRows,
  serializeDelimitedRows
} from "@/lib/delimitedText"

describe("delimited text", () => {
  it("conserva tabs, comillas y saltos de línea", () => {
    const rows = [[
      "Pregunta con\ttab",
      "Respuesta \"citada\"\nen dos líneas"
    ]]

    const serialized = serializeDelimitedRows(rows, "\t")

    expect(parseDelimitedRows(serialized, "\t")).toEqual(rows)
  })

  it("rechaza comillas sin cerrar", () => {
    expect(() => parseDelimitedRows('"pregunta\trespuesta', "\t"))
      .toThrow("comillas sin cerrar")
  })
})

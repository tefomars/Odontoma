import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./written-editor.css", import.meta.url), "utf8")
const editor = readFileSync(new URL("./OpenQuizContentEditor.tsx", import.meta.url), "utf8")

describe("protecciones responsive del editor de escritas", () => {
  it("carga estilos propios sin modificar las pantallas públicas de la app", () => {
    expect(editor).toContain('import "./written-editor.css"')
    expect(css).toContain(".studio-shell .studio-main .content-editor-panel")
    expect(css).not.toMatch(/^\s*(?:input|textarea|section|button)\s*\{/m)
  })

  it("adapta las columnas al espacio real del panel y permite encoger los campos", () => {
    expect(css).toContain("container: written-editor / inline-size")
    expect(css).toContain("@container written-editor (max-width: 680px)")
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))")
    expect(css).toMatch(/\.question-form, \.builder-field\)\s*\{\s*grid-template-columns: minmax\(0, 1fr\);/)
    expect(css).toMatch(/\.builder-field-heading small\s*\{[^}]*flex-basis: 100%;[^}]*overflow-wrap: anywhere;/)
  })

  it("evita que fieldsets, botones laterales y acciones inferiores impongan un ancho mínimo", () => {
    expect(css).toMatch(/fieldset\s*\{[^}]*min-width: 0;[^}]*min-inline-size: 0;/)
    expect(css).toMatch(/\.sidebar-section-heading > div\s*\{\s*flex-basis: 100%;/)
    expect(css).toMatch(/\.content-actions\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);/)
    expect(css).toMatch(/\.question-list-item\s*\{\s*min-width: 0;/)
  })
})

import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./builder.css", import.meta.url), "utf8")

describe("builder inspector overflow protections", () => {
  it("prevents long selected-block labels from sizing the inspector's grid track", () => {
    expect(css).toMatch(/\.live-inspector\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/)
    expect(css).toMatch(/\.inspector-header > div\s*\{[^}]*min-width: 0;/)
    expect(css).toMatch(/\.inspector-header h2\s*\{[^}]*overflow-wrap: anywhere;[^}]*white-space: normal;/)
  })

  it("allows fields and footer controls to shrink within the sidebar", () => {
    for (const selector of ["inspector-fields", "inspector-field", "inspector-actions"]) {
      expect(css).toMatch(new RegExp(`\\.${selector}\\s*\\{[^}]*grid-template-columns: minmax\\(0, 1fr\\);[^}]*min-width: 0;`))
    }
    expect(css).toMatch(/\.inspector-actions \.actions\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1\.35fr\);/)
    expect(css).toMatch(/\.structure-actions\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\);/)
    expect(css).toMatch(/\.inspector-field select\s*\{[^}]*min-width: 0;[^}]*max-width: 100%;/)
  })

  it("wraps the preview toolbar when the workspace leaves less horizontal room", () => {
    expect(css).toMatch(/\.universal-toolbar\s*\{[^}]*flex-wrap: wrap;/)
    expect(css).toMatch(/\.universal-mode-switcher\s*\{[^}]*flex-wrap: wrap;/)
  })
})

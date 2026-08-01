import { describe, expect, it } from "vitest"

import { renderBuilderCss, type BuilderTheme } from "./theme"

const theme: BuilderTheme = {
  enabled: true,
  primaryBackground: "#123456",
  primaryForeground: "#ffffff",
  primaryBorder: "#abcdef",
  outlineBackground: "#111111",
  outlineForeground: "#eeeeee",
  outlineBorder: "#777777",
  borderWidth: 2,
  radius: 20,
  shadow: 12,
  fontWeight: 700,
  focusColor: "#00ff99",
  focusWidth: 4
}

describe("builder appearance theme", () => {
  it("targets real app buttons as well as reusable Button components", () => {
    const css = renderBuilderCss(theme)

    expect(css).toContain('html[data-odontoma-app="true"]')
    expect(css).toContain("button.rounded-xl")
    expect(css).toContain("button.rounded-2xl")
    expect(css).toContain('[data-slot="button"]')
    expect(css).toContain("border-radius: 20px !important")
    expect(css).toContain("background: #123456 !important")
    expect(css).toContain("outline: 4px solid #00ff99 !important")
  })

  it("emits no overrides when appearance is disabled", () => {
    expect(renderBuilderCss({ ...theme, enabled: false }))
      .toBe("/* El tema visual local está desactivado. */\n")
  })
})

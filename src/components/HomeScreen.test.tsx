import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import HomeScreen from "./HomeScreen"

const noop = () => {}

describe("navegación del selector de materias", () => {
  it("alinea los botones al mismo ancho centrado que el contenido, también en el Builder", () => {
    for (const editorMode of [false, true]) {
      const html = renderToStaticMarkup(<HomeScreen onSelectSubject={noop} onBack={noop} onMainMenu={noop} editorMode={editorMode}/>)
      const navigationClasses = html.match(/class="([^"]*home-navigation-row[^"]*)"/)?.[1].split(/\s+/)
      expect(navigationClasses).toEqual(expect.arrayContaining(["mx-auto", "max-w-7xl", "flex", "items-center", "justify-between"]))
      expect(html).toContain("← Atrás")
      expect(html).toContain("Menú principal")
      expect(html).toContain("¿Qué vas a practicar?")
    }
  })

  it("no agrega acciones de navegación cuando no se proporcionan", () => {
    const html = renderToStaticMarkup(<HomeScreen onSelectSubject={noop}/>)
    expect(html).not.toContain("← Atrás")
    expect(html).not.toContain("Menú principal")
  })
})

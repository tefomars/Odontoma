import { renderToStaticMarkup } from "react-dom/server"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { OpenQuizDeck } from "@/content/openQuizzes"
import OpenQuizDecksScreen from "./OpenQuizDecksScreen"

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8")
const decks: OpenQuizDeck[] = ["Semiología", "Materiales dentales"].map((subject, index) => ({
  id: `deck-${index}`, title: `Cuestionario ${index}`, subject,
  questions: [{ id: `q-${index}`, prompt: "Pregunta", modelAnswer: "Respuesta", acceptedPoints: [] }]
}))
const render = (subject: string, partial: number | null = null, items = decks) => renderToStaticMarkup(
  <OpenQuizDecksScreen classes={[]} decks={items} selectedClass={subject} selectedPartial={partial}
    onSelectClass={() => {}} onSelectPartial={() => {}} onBack={() => {}} onMainMenu={() => {}} onStart={() => {}} />
)

describe("interacción de las tarjetas de cuestionarios escritos", () => {
  it.each(["Semiología", "Materiales dentales"])("aplica el efecto al cuestionario de %s, no solo a su carpeta", subject => {
    const html = render(subject)
    expect(html).toContain('class="open-quiz-deck-card group')
    expect(html).toContain("Comenzar →")
    expect(html).not.toContain("hover:brightness-110")
  })
  it("también lo aplica a cuestionarios agrupados por parcial y conserva vacíos deshabilitados", () => {
    expect(render("Materiales dentales", 2, [{ ...decks[1], partial: 2 }])).toContain("open-quiz-deck-card group")
    const empty = render("Materiales dentales", null, [{ ...decks[1], questions: [] }])
    expect(empty).toContain('disabled=""')
    expect(empty).toContain("Agregá preguntas desde el builder")
  })
  it("da feedback de hover y pulsación sin escalar ni reintroducir filtros", () => {
    const css = styles.slice(styles.indexOf("button.open-quiz-deck-card {"))
    expect(css).not.toMatch(/scale\(/)
    expect(css).toContain("transform: translateY(-4px)")
    expect(css).toContain("transform: translateY(1px)")
    expect(css).toContain("filter: none")
    expect(css).toContain("@media (hover: hover) and (pointer: fine)")
    expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    expect(css).toContain("button.open-quiz-deck-card:focus-visible")
  })
})

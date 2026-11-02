import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import StudyMethodScreen from "./StudyMethodScreen"
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8")

describe("main-menu hover rendering", () => {
  it("keeps the scoped rounded surface, destinations and arrow animation", () => {
    const html = renderToStaticMarkup(<StudyMethodScreen editorMode onSelectQuizzes={() => {}} onSelectFlashcards={() => {}} />)
    expect(html).toContain("study-method-card group")
    expect(html).not.toMatch(/class="study-method-card[^\"]*overflow-hidden/)
    expect(html).not.toContain("hover:scale-[1.01]")
    expect(html).toContain("group-hover:rotate-12")
    expect(html).toContain("main-menu")
    expect(html).toContain("Quizzes")
  })
  it("restores hover lift without brightness filters and retains keyboard focus", () => {
    expect(styles).toMatch(/button\.study-method-card:hover:not\(:disabled\),\s*button\.study-method-card:active:not\(:disabled\)\s*\{[^}]*filter: none;[^}]*scale: none;/)
    expect(styles).toMatch(/@media \(hover: hover\) and \(pointer: fine\)\s*\{\s*button\.study-method-card:hover:not\(:disabled\)\s*\{[^}]*transform: translateY\(-4px\);/)
    expect(styles).toContain("button.study-method-card:focus-visible")
  })
  it("removes the lift for reduced motion and keeps tap feedback separate", () => {
    expect(styles).toMatch(/button\.study-method-card:active:not\(:disabled\)\s*\{\s*transform: translateY\(0\);/)
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*button\.study-method-card:hover:not\(:disabled\),\s*button\.study-method-card:active:not\(:disabled\)\s*\{\s*transform: none;/)
  })
  it("avoids native button painting and clipped gradient layers on the animated surface", () => {
    expect(styles).toMatch(/button\.study-method-card\s*\{[^}]*-webkit-appearance: none;[^}]*appearance: none;[^}]*background-image: none;[^}]*background-clip: padding-box;/)
    const cardStyles = styles.slice(styles.indexOf("button.study-method-card {"))
    expect(cardStyles).not.toContain("linear-gradient")
    expect(cardStyles).not.toMatch(/scale\(/)
  })
})

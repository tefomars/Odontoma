import type { HomeContent, FlashcardSubjectBlock } from "./types.ts"
import type { CustomPage } from "./customPageSchema.ts"

export type NavigationTarget = { panel: "structure" | "pages"; view?: "main-menu" | "quiz-menu" | "subjects" | "flashcard-subjects"; id: string; blockId?: string }
export type NavigationIssue = { id: string; severity: "error" | "warning"; message: string; target: NavigationTarget }
export type NavigationBank = { id: string; title: string; archived?: boolean; enabled?: boolean }
export type NavigationProject = { home: HomeContent; decks: FlashcardSubjectBlock[]; pages: Pick<CustomPage, "id" | "title" | "blocks">[]; banks: NavigationBank[] }
const builtins = new Set(["home", "quizzes", "flashcards", "multiple-choice", "open-ended", "open-quizzes", "my-quizzes", "backup", "pre-partial", "coming-soon", "history"])

export function validateNavigation(project: NavigationProject): NavigationIssue[] {
  const issues: NavigationIssue[] = []
  const pages = new Set(project.pages.map(p => p.id))
  const banks = new Map(project.banks.map(b => [b.id, b]))
  function check(destination: string | undefined, label: string, target: NavigationTarget, ownPage?: string) {
    if (!destination) { issues.push({ id: `${target.panel}:${target.id}:${target.blockId || ""}`, severity: "warning", message: `${label}: este botón todavía no tiene destino.`, target }); return }
    let message = "", severity: "error" | "warning" = "error"
    if (destination.startsWith("custom-page:")) {
      const id = destination.slice("custom-page:".length)
      if (!pages.has(id)) message = "abre un menú que ya no existe. Elegí otro destino o quitá este acceso."
      else if (id === ownPage) { message = "vuelve a abrir este mismo menú."; severity = "warning" }
    } else if (/^(bank|flashcard-bank):/.test(destination) || banks.has(destination)) {
      const id = destination.replace(/^(bank|flashcard-bank):/, "")
      const bank = banks.get(id)
      if (!bank) message = "abre un banco que ya no existe. Elegí otro destino o quitá este acceso."
      else if (bank.archived || bank.enabled === false) { message = `abre el banco oculto o archivado «${bank.title}». Recuperalo o cambiá el destino.`; severity = "warning" }
    } else if (!builtins.has(destination)) message = "tiene un destino desconocido. Elegí uno desde el selector."
    if (message) issues.push({ id: `${target.panel}:${target.view || ""}:${target.id}:${target.blockId || ""}`, severity, message: `${label}: ${message}`, target })
  }
  for (const [menu, view] of [[project.home.mainMenu, "main-menu"], [project.home.quizMenu, "quiz-menu"]] as const) for (const card of menu.cards) check(card.destination || card.id, `«${menu.title}» → «${card.title}»`, { panel: "structure", view, id: card.id })
  for (const card of project.home.subjects) if (!card.hidden) check(card.destination, `Materias de quizzes → «${card.title}»`, { panel: "structure", view: "subjects", id: card.id })
  for (const card of project.decks) if (!card.hidden) check(card.destination, `Materias de flashcards → «${card.title}»`, { panel: "structure", view: "flashcard-subjects", id: card.id })
  for (const page of project.pages) for (const block of page.blocks) if (block.type === "button") check(block.destination, `«${page.title}» → «${block.title || "Botón"}»`, { panel: "pages", id: page.id, blockId: block.id }, page.id)
  return issues
}

export type ProjectSnapshot = { app: "Odontoma Project"; version: 1; files: Record<string, unknown>; revision?: string }
export type HistoryEntry = { name: string; createdAt: string; label: string; kind: "automatic" | "checkpoint" | "publication"; changes: string[]; counts: { banks: number; questions: number; flashcards: number; written: number; pages: number } }
type Bank = { id: string; title: string; archived?: boolean; questions?: unknown[]; flashcards?: unknown[]; chapters?: unknown[] }
const areaNames: Record<string, string> = { home: "Menús y materias", decks: "Portadas y decks", pages: "Pantallas personalizadas", written: "Cuestionarios escritos", overrides: "Ajustes visuales", theme: "Apariencia", organization: "Subdivisiones y organización", changelog: "Versión e historial de cambios" }

export function describeChanges(before: ProjectSnapshot, after: ProjectSnapshot): string[] {
  const changes: string[] = []
  const banks = (p: ProjectSnapshot) => ((p.files.library as { banks?: Bank[] })?.banks || [])
  const oldBanks = banks(before), newBanks = banks(after)
  for (const bank of newBanks) {
    const old = oldBanks.find(b => b.id === bank.id)
    if (!old) changes.push(`Materia agregada: ${bank.title}`)
    else if (JSON.stringify(old) !== JSON.stringify(bank)) changes.push(`${bank.archived && !old.archived ? "Materia quitada" : !bank.archived && old.archived ? "Materia recuperada" : "Contenido modificado"}: ${bank.title}`)
  }
  for (const bank of oldBanks) if (!newBanks.some(b => b.id === bank.id)) changes.push(`Materia quitada: ${bank.title}`)
  for (const [area, name] of Object.entries(areaNames)) if (JSON.stringify(before.files[area]) !== JSON.stringify(after.files[area])) changes.push(name)
  return changes.length ? changes : ["Sin diferencias en el contenido editable"]
}

export function projectCounts(project: ProjectSnapshot) {
  const banks = ((project.files.library as { banks?: Bank[] })?.banks || []).filter(b => !b.archived)
  const written = (project.files.written as { decks?: { questions: unknown[] }[] })?.decks || []
  return { banks: banks.length, questions: banks.reduce((n, b) => n + (b.questions?.length || 0), 0), flashcards: banks.reduce((n, b) => n + (b.flashcards?.length || 0), 0), written: written.reduce((n, d) => n + d.questions.length, 0), pages: Array.isArray(project.files.pages) ? project.files.pages.length : 0 }
}

export function historyDate(name: string) {
  const timestamp = name.replace(/^project-/, "").replace(/\.json$/, "").replaceAll("_", ":")
  return new Date(timestamp).toISOString()
}

export function localHistoryDate(timestamp: string) {
  return new Intl.DateTimeFormat("es-GT", { timeZone: "America/Guatemala", dateStyle: "medium", timeStyle: "medium" }).format(new Date(timestamp))
}

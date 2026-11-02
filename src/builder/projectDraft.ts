import { draft } from "./LibraryEditor"
import type { ProjectSnapshot } from "./projectHistory"

export async function collectProjectDraft(): Promise<ProjectSnapshot> {
  const pending = { writes: [] as Promise<unknown>[], files: {} as Record<string, unknown> }
  window.dispatchEvent(new CustomEvent("odontoma-flush-drafts", { detail: pending }))
  await Promise.all(pending.writes)
  const response = await fetch("/__odontoma-studio/project")
  if (!response.ok) throw new Error(await response.text())
  const project: ProjectSnapshot = await response.json()
  Object.assign(project.files, pending.files)
  const library = await draft()
  if (!library) throw new Error("Esperá a que cargue la biblioteca.")
  project.files.library = library
  return project
}

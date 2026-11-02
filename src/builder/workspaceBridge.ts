import { useEffect, useState } from "react"
import { studioBanks } from "@/content/studio/catalog"
import { customPages } from "@/content/appBuilder/customPages"

export type WorkspaceTarget = { panel: "library" | "structure" | "pages" | "written" | "preview" | "appearance" | "history" | "sections" | "create" | "formats"; bankId?: string; chapterId?: string; mode?: "questions" | "flashcards"; view?: "main-menu" | "quiz-menu" | "subjects" | "flashcard-subjects"; id?: string; blockId?: string; name?: string; subject?: string; destination?: string; stamp?: number }
export type BankIndex = { id: string; title: string; subject: string; kind: string; archived?: boolean; enabled?: boolean; questions: number; flashcards: number; chapters: { id: string; title: string }[] }
const indexCache = new Map<string, unknown>()
type WrittenIndex = { classes: { id: string; name: string }[]; decks: { id: string; title: string; subject: string }[] }
export function useWorkspaceWritten() {
  const [written, setWritten] = useState<WrittenIndex>(() => indexCache.get("written") as WrittenIndex || { classes: [], decks: [] })
  useEffect(() => { const listener = (e: Event) => { const d = (e as CustomEvent).detail; if (d.area === "written") setWritten(d.items) }; window.addEventListener("odontoma-workspace-index", listener); return () => window.removeEventListener("odontoma-workspace-index", listener) }, [])
  return written
}
export const workspaceNavigate = (target: WorkspaceTarget) => window.dispatchEvent(new CustomEvent("odontoma-workspace-navigate", { detail: target }))
export function publishIndex(area: string, items: unknown) { indexCache.set(area, items); window.dispatchEvent(new CustomEvent("odontoma-workspace-index", { detail: { area, items } })) }

export function useWorkspaceBanks() {
  const [banks, setBanks] = useState<BankIndex[]>(() => indexCache.get("banks") as BankIndex[] || studioBanks.map(b => ({ ...b, questions: b.questions.length, flashcards: b.flashcards.length })))
  useEffect(() => { const listener = (e: Event) => { const d = (e as CustomEvent).detail; if (d.area === "banks") setBanks(d.items) }; window.addEventListener("odontoma-workspace-index", listener); return () => window.removeEventListener("odontoma-workspace-index", listener) }, [])
  return banks
}

export function useWorkspacePages() {
  const [pages, setPages] = useState<Array<{ id: string; title: string }>>(() => indexCache.get("pages") as Array<{ id: string; title: string }> || customPages)
  useEffect(() => { const listener = (e: Event) => { const d = (e as CustomEvent).detail; if (d.area === "pages") setPages(d.items) }; window.addEventListener("odontoma-workspace-index", listener); return () => window.removeEventListener("odontoma-workspace-index", listener) }, [])
  return pages
}

// Compatibility for editor-local controls; commands are owned by StudioWorkspace.
export function useWorkspaceHistory(_active: boolean, _history: { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean }) {}

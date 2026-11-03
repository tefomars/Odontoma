import type { StudioData } from "../content/studio/schema.ts"

export type LibraryDraft = { data: StudioData; baseRevision?: string; savedAt?: string }
export async function contentRevision(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")
}

export function readLibraryDraft(value: unknown): LibraryDraft | undefined {
  if (!value || typeof value !== "object") return undefined
  const record = value as LibraryDraft & StudioData
  const data = record.data || record
  if (data.version !== 1 || !Array.isArray(data.banks)) return undefined
  return { data, baseRevision: record.baseRevision, savedAt: record.savedAt }
}

export function draftNeedsReview(saved: LibraryDraft | undefined, current: StudioData, revision: string) {
  return Boolean(saved && JSON.stringify(saved.data) !== JSON.stringify(current) && saved.baseRevision !== revision)
}

export type ItemCounts = { added: number; modified: number; removed: number }
export function itemChanges(before: { id: string }[], after: { id: string }[]): ItemCounts {
  const old = new Map(before.map(item => [item.id, item]))
  const next = new Map(after.map(item => [item.id, item]))
  return {
    added: after.filter(item => !old.has(item.id)).length,
    modified: after.filter(item => old.has(item.id) && JSON.stringify(old.get(item.id)) !== JSON.stringify(item)).length,
    removed: before.filter(item => !next.has(item.id)).length,
  }
}

export function libraryChanges(before: StudioData, after: StudioData) {
  const collect = (data: StudioData, type: "questions" | "flashcards") => data.banks.flatMap(bank => bank[type].map(item => ({ ...item, id: `${bank.id}:${item.id}` })))
  return { questions: itemChanges(collect(before, "questions"), collect(after, "questions")), flashcards: itemChanges(collect(before, "flashcards"), collect(after, "flashcards")) }
}

export function writtenChanges(before: unknown, after: unknown) {
  type Written = { decks?: { id: string; questions?: { id: string }[] }[] }
  const collect = (value: unknown) => (value as Written | undefined)?.decks?.flatMap(deck => (deck.questions || []).map(question => ({ ...question, id: `${deck.id}:${question.id}` }))) || []
  return itemChanges(collect(before), collect(after))
}

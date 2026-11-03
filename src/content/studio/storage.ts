import type { StudyBank, StudioData } from "./schema"

type Changes<T extends { id: string }> = { upserts: T[]; removed: string[]; order?: string[] }
export type BankPatch = {
  title?: string; subject?: string; enabled?: boolean; archived?: boolean; kind?: StudyBank["kind"]
  chapters?: StudyBank["chapters"]
  questions?: Changes<StudyBank["questions"][number]>
  flashcards?: Changes<StudyBank["flashcards"][number]>
}
export type StudioStorage = StudioData & { patches?: Record<string, BankPatch> }
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function changes<T extends { id: string }>(before: T[], after: T[]): Changes<T> | undefined {
  const previous = new Map(before.map(item => [item.id, item]))
  const next = new Set(after.map(item => item.id))
  const upserts = after.filter(item => !equal(previous.get(item.id), item))
  const removed = before.filter(item => !next.has(item.id)).map(item => item.id)
  const order = equal(before.map(item => item.id), after.map(item => item.id)) ? undefined : after.map(item => item.id)
  return upserts.length || removed.length || order ? { upserts, removed, ...(order ? { order } : {}) } : undefined
}

function applyChanges<T extends { id: string }>(before: T[], edits?: Changes<T>): T[] {
  if (!edits) return before
  const result = new Map(before.map(item => [item.id, item]))
  for (const id of edits.removed) result.delete(id)
  for (const item of edits.upserts) result.set(item.id, item)
  if (!edits.order) return [...result.values()]
  const orderedIds = new Set(edits.order)
  return [
    ...edits.order.map(id => result.get(id)!).filter(Boolean),
    ...[...result.values()].filter(item => !orderedIds.has(item.id))
  ]
}

export function applyBankPatch(bank: StudyBank, patch?: BankPatch): StudyBank {
  if (!patch) return bank
  return { ...bank, ...patch, questions: applyChanges(bank.questions, patch.questions), flashcards: applyChanges(bank.flashcards, patch.flashcards) }
}

export function compactLibrary(full: StudioData, original: StudyBank[]): StudioStorage {
  const banks: StudyBank[] = []
  const patches: Record<string, BankPatch> = {}
  for (const bank of full.banks) {
    const base = original.find(item => item.id === bank.id)
    if (!base) { banks.push(bank); continue }
    const patch: BankPatch = {}
    if (bank.title !== base.title) patch.title = bank.title
    if (bank.subject !== base.subject) patch.subject = bank.subject
    if (bank.kind !== base.kind) patch.kind = bank.kind
    if ((bank.enabled !== false) !== (base.enabled !== false)) patch.enabled = bank.enabled !== false
    if (Boolean(bank.archived) !== Boolean(base.archived)) patch.archived = Boolean(bank.archived)
    const normalize = (chapters: StudyBank["chapters"]) => chapters.map(c => ({ ...c, image: c.image?.startsWith("/src/") ? "@legacy" : c.image || "" }))
    if (!equal(normalize(bank.chapters), normalize(base.chapters))) patch.chapters = normalize(bank.chapters)
    const questions = changes(base.questions, bank.questions); if (questions) patch.questions = questions
    const flashcards = changes(base.flashcards, bank.flashcards); if (flashcards) patch.flashcards = flashcards
    if (Object.keys(patch).length) patches[bank.id] = patch
  }
  return { version: 1, banks, ...(Object.keys(patches).length ? { patches } : {}) }
}

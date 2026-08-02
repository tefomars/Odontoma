export const BUILDER_SNAPSHOTS_KEY = "odontoma-builder-auto-snapshots-v1"

export type BuilderSnapshot = {
  id: string
  area: string
  createdAt: string
  data: unknown
}

export function loadBuilderSnapshots(): BuilderSnapshot[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(BUILDER_SNAPSHOTS_KEY) || "[]")
    return Array.isArray(parsed) ? parsed.slice(0, 5) as BuilderSnapshot[] : []
  } catch {
    return []
  }
}

export function saveBuilderSnapshot(area: string, data: unknown) {
  const snapshot: BuilderSnapshot = {
    id: `snapshot-${Date.now()}-${crypto.randomUUID()}`,
    area,
    createdAt: new Date().toISOString(),
    data
  }
  const next = [snapshot, ...loadBuilderSnapshots()].slice(0, 5)
  localStorage.setItem(BUILDER_SNAPSHOTS_KEY, JSON.stringify(next))
  return next
}

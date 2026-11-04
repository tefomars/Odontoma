export type ChangelogEntry = { id: string; date: string; title: string; body: string; hidden?: boolean }
export type ChangelogData = { version: 1; appVersion?: string; title: string; description: string; entries: ChangelogEntry[] }

// `version: 1` is the editable-file schema, not the application's release number.
// Keep the release in content so the owner can change it without editing code.
export function validAppVersion(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/.test(value)
}

export function resolveAppVersion(value: unknown, fallback: string): string {
  return validAppVersion(value) ? value : fallback
}

export function bumpAppVersion(value: string, step: "patch" | "minor" | "major"): string | null {
  if (!validAppVersion(value)) return null
  const [major, minor, patch] = value.split(".").map(Number)
  const next = step === "major" ? `${major + 1}.0.0` : step === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`
  return validAppVersion(next) ? next : null
}

export function changelogCalendarDate(date: string): string {
  if (date.length === 10) return date
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Guatemala" }).formatToParts(new Date(date))
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)!.value).join("-")
}

export function validChangelog(value: unknown): value is ChangelogData {
  const data = value as ChangelogData | null
  const text = (v: unknown, max: number, required = false) => typeof v === "string" && v.length <= max && (!required || !!v.trim())
  if (!data || data.version !== 1 || !text(data.title, 180, true) || !text(data.description, 1000) || !Array.isArray(data.entries) || data.entries.length > 500) return false
  if (data.appVersion !== undefined && !validAppVersion(data.appVersion)) return false
  const ids = new Set<string>()
  return data.entries.every(entry => {
    if (!entry || !text(entry.id, 160, true) || ids.has(entry.id) || !text(entry.title, 300, true) || !text(entry.body, 12000) || !text(entry.date, 40, true) || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(entry.date) || !Number.isFinite(Date.parse(entry.date)) || (entry.hidden !== undefined && typeof entry.hidden !== "boolean")) return false
    ids.add(entry.id)
    return true
  })
}

export function resolveChangelog(commits: readonly ChangelogEntry[], data: ChangelogData, includeHidden = false): ChangelogEntry[] {
  const entries = new Map(commits.map(entry => [entry.id, entry]))
  // An edited/hidden commit is an override, not a second announcement. Generated
  // metadata is separate so a later build cannot erase the owner's edits.
  for (const entry of data.entries) entries.set(entry.id, entry)
  return [...entries.values()].filter(entry => includeHidden || !entry.hidden)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}

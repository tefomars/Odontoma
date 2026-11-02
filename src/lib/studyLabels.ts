/** Internal keys stay stable for progress; only human-readable names belong in the UI. */
export function chapterEyebrow(chapter: { id: string; title: string; eyebrow?: string }): string {
  if (chapter.eyebrow?.trim()) return chapter.eyebrow
  if (chapter.id === chapter.title) return ""
  const internal = /^(?:chapter|studio|bank)-/i.test(chapter.id)
    || /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(chapter.id)
  return internal ? "Capítulo" : chapter.id
}
export function chapterDisplayName(chapter: { id: string; title: string; eyebrow?: string }): string {
  const eyebrow = chapterEyebrow(chapter)
  return !eyebrow || eyebrow === chapter.title || eyebrow === "Capítulo" ? chapter.title : `${eyebrow} · ${chapter.title}`
}

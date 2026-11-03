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

/** Personal cards store a topic ID, not a title. Resolve it for display only. */
export function flashcardTopicLabel(
  card: { topic: string; chapter: string },
  source: "default" | "user",
  topics: readonly { id: string; name: string }[] = []
): string {
  if (source !== "user") return card.topic
  const name = topics.find(topic => topic.id === card.topic)?.name.trim()
  if (name) return name
  // Older imports may lack topic metadata but retain a readable chapter name.
  const chapter = card.chapter?.trim()
  return chapter && !/^topic-\d+-[\da-f-]+$/i.test(chapter) ? chapter : "Mis flashcards"
}

import type { Flashcard } from "../flashcards/histologia/cards.ts"

export type StudyQuestion = { id: string; chapter: string; topic?: string; tags?: string[]; difficulty: string; type: string; question: string; options: string[]; correctAnswers: number[]; explanation: string; image?: string; imageAlt?: string }
export type StudyChapter = { id: string; title: string; eyebrow?: string; subtitle: string; description: string; image: string; questionCount: number; accent: string }
export type StudyBank = { id: string; title: string; subject: string; enabled?: boolean; archived?: boolean; kind: "course" | "prepartial"; chapters: StudyChapter[]; questions: StudyQuestion[]; flashcards: Flashcard[] }
export type StudioData = { version: 1; banks: StudyBank[] }
export function validateStudio(value: unknown): string[] {
  try {
  const issues: string[] = []
  const data = value as StudioData
  if (!data || data.version !== 1 || !Array.isArray(data.banks)) return ["Formato de biblioteca inválido."]
  const ids = new Set<string>()
  for (const bank of data.banks) {
    if (!bank || !bank.id || ids.has(bank.id) || !bank.title?.trim() || !bank.subject?.trim() || !["course", "prepartial"].includes(bank.kind)) { issues.push("Hay una materia sin título o con identificador repetido."); continue }
    ids.add(bank.id)
    if (bank.enabled !== undefined && typeof bank.enabled !== "boolean") issues.push(`${bank.title}: visibilidad inválida.`)
    if (bank.archived !== undefined && typeof bank.archived !== "boolean") issues.push(`${bank.title}: estado de archivo inválido.`)
    if (!Array.isArray(bank.chapters) || !Array.isArray(bank.questions) || !Array.isArray(bank.flashcards)) { issues.push(`${bank.title}: estructura incompleta.`); continue }
    const chapters = new Set(bank.chapters.map(c => c.id))
    const imageSafe = (src: unknown) => src === undefined || src === "" || src === "@legacy" || (typeof src === "string" && (/^https?:\/\//.test(src) || /^data:image\/(png|jpeg|webp|gif);base64,/.test(src) || /^\/(src|assets|media)\//.test(src)))
    if (bank.chapters.some(c => !imageSafe(c.image)) || bank.questions.some(q => !imageSafe(q.image)) || bank.flashcards.some(c => !imageSafe(c.image) || !imageSafe(c.backImage))) issues.push(`${bank.title}: imagen inválida. Usá una imagen o una dirección HTTP/HTTPS.`)
    if (chapters.size !== bank.chapters.length || bank.chapters.some(c => !c.id || !c.title?.trim())) issues.push(`${bank.title}: capítulos vacíos o repetidos.`)
    const itemIds = new Set<string>()
    for (const q of bank.questions) {
      if (!q.id || itemIds.has(q.id) || !q.question?.trim() || !chapters.has(q.chapter) || !["easy", "medium", "hard"].includes(q.difficulty) || !["single", "multiple"].includes(q.type) || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8 || q.options.some(o => typeof o !== "string" || !o.trim()) || new Set(q.options.map(o => o.trim().toLowerCase())).size !== q.options.length || !Array.isArray(q.correctAnswers) || !q.correctAnswers.length || (q.type === "single" && q.correctAnswers.length !== 1) || q.correctAnswers.some(n => !Number.isInteger(n) || n < 0 || n >= q.options.length)) issues.push(`${bank.title}: revisá la pregunta “${q.question?.slice(0, 65) || q.id}”.`)
      itemIds.add(q.id)
    }
    itemIds.clear() // Quiz statistics and FSRS have independent ID namespaces.
    for (const c of bank.flashcards) {
      if (!c.id || itemIds.has(c.id) || !c.front?.trim() || !c.back?.trim() || !chapters.has(c.chapter)) issues.push(`${bank.title}: revisá la tarjeta “${c.front?.slice(0, 65) || c.id}”.`)
      itemIds.add(c.id)
    }
  }
  return issues
  } catch { return ["La importación contiene campos incompletos o de un tipo incorrecto."] }
}

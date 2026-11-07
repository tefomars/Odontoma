import type { StudyBank, StudyQuestion } from "../studio/schema"
import { shuffleArray } from "@/lib/shuffleQuestion"

const FINAL_PREFIX = "prepartial-final:"
export type PrePartialPreference = "new" | "incorrect" | "mixed"
type QuestionStats = Record<string, { correct?: number; incorrect?: number }>

export function isCumulativePrePartial(id: string) {
  return id.startsWith(FINAL_PREFIX)
}

/** Derived view, not a saved duplicate of the source banks. */
export function createCumulativePrePartial(
  banks: readonly StudyBank[],
  subject: string,
  title = "Examen final",
  classTitle = subject
): StudyBank | undefined {
  const sources = banks.filter(bank =>
    bank.kind === "prepartial" && !isCumulativePrePartial(bank.id) &&
    bank.subject === subject && bank.enabled !== false && !bank.archived && bank.questions.length > 0
  )
  if (sources.length < 2) return undefined

  const id = `${FINAL_PREFIX}${encodeURIComponent(subject)}`
  const questions = sources.flatMap(bank => bank.questions.map(question => ({
    ...question,
    // Separate progress: taking/resetting the final never changes a partial.
    id: `${id}:${encodeURIComponent(bank.id)}:${encodeURIComponent(question.id)}`,
    chapter: bank.id,
    tags: [`${id}:progress`],
  })))
  return {
    id,
    title: `${title} · ${classTitle}`,
    subject,
    kind: "prepartial",
    enabled: true,
    questions,
    flashcards: [],
    chapters: sources.map(bank => ({
      id: bank.id,
      title: bank.title,
      subtitle: "Parcial incluido en el examen final",
      description: "",
      image: "",
      accent: "from-amber-500/20 to-violet-500/20",
      questionCount: bank.questions.length,
    })),
  }
}

/** Equal turns per available partial; a small bank does not get duplicated. */
export function selectPrePartialQuestions(
  bank: Pick<StudyBank, "id" | "questions">,
  amount: number,
  preference: PrePartialPreference,
  stats: QuestionStats = {}
): StudyQuestion[] {
  if (!Number.isFinite(amount) || amount <= 0) return []
  const limit = Math.floor(amount)
  const pool = bank.questions.filter(question => {
    const record = stats[question.id]
    if (preference === "new") return (record?.correct || 0) + (record?.incorrect || 0) === 0
    if (preference === "incorrect") return (record?.incorrect || 0) > 0
    return true
  })
  if (!isCumulativePrePartial(bank.id)) return shuffleArray(pool).slice(0, limit)

  const groups = new Map<string, StudyQuestion[]>()
  for (const question of shuffleArray(pool)) {
    const group = groups.get(question.chapter) || []
    group.push(question)
    groups.set(question.chapter, group)
  }
  const selected: StudyQuestion[] = []
  while (selected.length < limit && groups.size > 0) {
    for (const chapter of shuffleArray([...groups.keys()])) {
      const group = groups.get(chapter)!
      selected.push(group.pop()!)
      if (group.length === 0) groups.delete(chapter)
      if (selected.length >= limit) break
    }
  }
  return shuffleArray(selected)
}

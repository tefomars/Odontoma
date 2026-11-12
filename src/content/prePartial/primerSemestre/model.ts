import type { StudyBank } from "@/content/studio/schema"

export const CITO_I_SUBJECT = "Citohistología I"
export type ChoiceRow = readonly [question: string, correct: string, d1: string, d2: string, d3: string, explanation: string]
export type RecallRow = readonly [front: string, back: string]
export type TruthRow = readonly [statement: string, correct: boolean, explanation: string]
export type ReviewGroup = { id: string; title: string; choices: readonly ChoiceRow[]; cards: readonly RecallRow[]; truth?: readonly TruthRow[] }

/** Only packaging is shared. Every stem, alternative and card is authored in its source group. */
export function firstSemesterBank(id: string, title: string, groups: readonly ReviewGroup[]): StudyBank {
  return {
    id, title, subject: CITO_I_SUBJECT, kind: "prepartial", enabled: true,
    chapters: [{ id, title, subtitle: "Última vuelta · primer semestre", description: "", image: "", accent: "from-cyan-500/20 to-violet-500/20", questionCount: groups.reduce((n, g) => n + g.choices.length + (g.truth?.length || 0), 0) }],
    questions: groups.flatMap(group => [
      ...group.choices.map(([question, correct, d1, d2, d3, explanation], i) => ({
        id: `pre-cito-i-${id}-${group.id}-mc-${i + 1}`, chapter: id, topic: group.title,
        difficulty: "medium" as const, type: "single" as const, question,
        options: [correct, d1, d2, d3], correctAnswers: [0], explanation,
        tags: [id, group.title, "Cito I · última vuelta"],
      })),
      ...(group.truth || []).map(([question, correct, explanation], i) => ({
        id: `pre-cito-i-${id}-${group.id}-vf-${i + 1}`, chapter: id, topic: group.title,
        difficulty: "medium" as const, type: "single" as const, question,
        options: ["Verdadero", "Falso"], correctAnswers: [correct ? 0 : 1], explanation,
        tags: [id, group.title, "Cito I · última vuelta"],
      })),
    ]),
    flashcards: groups.flatMap(group => group.cards.map(([front, back], i) => ({
      id: `pre-cito-i-${id}-${group.id}-card-${i + 1}`, chapter: id,
      subject: CITO_I_SUBJECT, book: "Repaso pre-parcial · Ross",
      topic: group.title, subtopic: "Esenciales", front, back,
      tags: [id, group.title, "Cito I · última vuelta"],
    }))),
  }
}

import type { StudyBank, StudyChapter } from "../studio/schema"
import { glosarioP1 } from "./glosario-p1"
import { amalgamas } from "./amalgamas"
import { historia } from "./historia"
import { glosarioP2 } from "./glosario-p2"
import { composites } from "./composites"
import { adhesivos } from "./adhesivos"
import { ionomeros } from "./ionomeros"

export const materialBlocks = [glosarioP1, amalgamas, historia, glosarioP2, composites, adhesivos, ionomeros]
export const materialesCards = materialBlocks.flatMap(item => item.cards)
export const materialesQuestions = materialBlocks.flatMap(item => item.questions)
const chapterPhotos: Record<string, string> = {
  "md-glosario-p1": "materiales",
  "md-amalgamas": "amalgamas",
  "md-historia": "historia",
  "md-glosario-p2": "fotocurado",
  "md-composites": "composites",
  "md-adhesivos": "adhesivos",
  "md-ionomeros": "ionomeros"
}
export const materialesChapters: StudyChapter[] = materialBlocks.map(item => ({ id: item.id, title: item.title, eyebrow: item.title, subtitle: `Parcial ${item.partial}`, description: item.description, questionCount: item.questions.length, image: `/media/materiales-dentales/${chapterPhotos[item.id]}.jpg`, accent: item.partial === 1 ? "from-amber-500/25 to-orange-500/10" : "from-sky-500/25 to-cyan-500/10" }))
export const materialesBank: StudyBank = { id: "materiales-dentales", title: "Materiales dentales", subject: "Materiales dentales", kind: "course", chapters: materialesChapters, questions: materialesQuestions, flashcards: materialesCards }

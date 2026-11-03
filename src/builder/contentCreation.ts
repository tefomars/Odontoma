import type { StudioData, StudyBank } from "../content/studio/schema"
import { validateStudio } from "../content/studio/schema"
import type { OpenQuizContent } from "../content/openQuizzes/types"
import type { ImportedItem } from "./contentImport"
import type { ImportKind } from "./contentFormats"
import type { WorkspaceTarget } from "./workspaceBridge"

export type ContentCreation = {
  type: ImportKind; kind: "course" | "prepartial"; subject: string; title: string
  bankId: string; newBank: boolean; chapterId: string; newChapter: boolean; chapterTitle: string
  deckId: string; newDeck: boolean; image: string; quizAccess: boolean; flashcardAccess: boolean; sectionId: string
  items: ImportedItem[]; partial?: number | null
}
export type CreationEvent = { request: ContentCreation; accepted?: boolean; target?: WorkspaceTarget; error?: string }
export function addLibraryContent(data: StudioData, request: ContentCreation, id: () => string): StudioData {
  const found = data.banks.find(b => b.id === request.bankId)
  if (request.newBank && found) throw new Error("Ya existe ese banco.")
  if (!request.newBank && (!found || found.archived)) throw new Error("El banco ya no está disponible.")
  const bank: StudyBank = found || { id: request.bankId, title: request.title.trim(), subject: request.subject.trim(), kind: request.kind, chapters: [], questions: [], flashcards: [] }
  if (!request.newChapter && !bank.chapters.some(c => c.id === request.chapterId)) throw new Error("El capítulo ya no está disponible.")
  const chapters = request.newChapter ? [...bank.chapters, { id: request.chapterId, title: request.chapterTitle.trim(), subtitle: "", description: "", image: request.image, accent: "from-violet-500/20 to-sky-500/20", questionCount: 0 }] : bank.chapters
  const chapter = chapters.find(c => c.id === request.chapterId)!
  const mode = request.type === "flashcards" ? "flashcards" : "questions"
  const added = request.items.map(q => mode === "flashcards" ? { ...q, id: id(), subject: bank.subject, book: bank.title, chapter: request.chapterId, topic: q.topic || chapter.title, subtopic: q.subtopic || "General", front: q.front!, back: q.back!, tags: q.tags || [] } : { ...q, id: id(), chapter: request.chapterId, question: q.question!, options: q.options!, correctAnswers: q.correctAnswers!, type: q.correctAnswers!.length > 1 ? "multiple" : "single", difficulty: q.difficulty || "medium", explanation: q.explanation || "", topic: q.topic || chapter.title })
  const updated = { ...bank, chapters, [mode]: [...bank[mode], ...added] }
  const issues = validateStudio({ version: 1, banks: [updated] })
  if (issues.length) throw new Error(issues.slice(0, 5).join("\n"))
  return { ...data, banks: found ? data.banks.map(b => b.id === bank.id ? updated : b) : [...data.banks, updated] } as StudioData
}
export function addWrittenContent(data: OpenQuizContent, request: ContentCreation, id: () => string): OpenQuizContent {
  if (!request.subject.trim() || !request.title.trim()) throw new Error("Falta la clase o el nombre del cuestionario.")
  const found = data.decks.find(d => d.id === request.deckId)
  if (request.newDeck && found) throw new Error("Ya existe ese cuestionario.")
  if (!request.newDeck && !found) throw new Error("El cuestionario ya no está disponible.")
  const classes = data.classes || []
  const classItem = classes.find(c => c.name === request.subject) || { id: id(), name: request.subject.trim(), symbol: "▰", color: "#22c55e" }
  const questions = request.items.map(q => {
    if (!q.prompt?.trim() || !q.modelAnswer?.trim()) throw new Error("Hay una pregunta escrita incompleta.")
    return { id: id(), prompt: q.prompt, modelAnswer: q.modelAnswer, acceptedPoints: q.acceptedPoints || [], explanation: q.explanation || "", image: q.image, imageAlt: q.imageAlt, backImage: q.backImage, backImageAlt: q.backImageAlt }
  })
  const deck = found || { id: request.deckId, subject: classItem.name, title: request.title.trim(), partial: request.partial || null, description: "", color: classItem.color, classColor: classItem.color, classSymbol: classItem.symbol, questions: [] }
  if (found && found.subject !== classItem.name) throw new Error("El cuestionario no pertenece a esa clase.")
  const updated = { ...deck, questions: [...deck.questions, ...questions] }
  return { ...data, classes: classes.some(c => c.name === classItem.name) ? classes : [...classes, classItem], decks: found ? data.decks.map(d => d.id === deck.id ? updated : d) : [...data.decks, updated] }
}

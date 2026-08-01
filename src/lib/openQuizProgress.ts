import type { OpenQuizGrade } from "@/content/openQuizzes"
import type { QuizResponseRecord } from "@/lib/quizHistory"

export const OPEN_QUIZ_PROGRESS_KEY = "odontoma_open_quiz_progress_v1"

export type OpenQuizProgress = {
  deckId: string
  questionIds: string[]
  current: number
  studentAnswer: string
  revealed: boolean
  grades: Record<OpenQuizGrade, number>
  responses: QuizResponseRecord[]
  savedAt: string
}

type StoredProgress = Record<string, OpenQuizProgress>

function loadAll(): StoredProgress {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(OPEN_QUIZ_PROGRESS_KEY) || "{}")
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as StoredProgress
      : {}
  } catch {
    return {}
  }
}

export function loadOpenQuizProgress(deckId: string) {
  const progress = loadAll()[deckId]
  if (!progress || !Array.isArray(progress.questionIds) || !Array.isArray(progress.responses)) {
    return null
  }
  return progress
}

export function saveOpenQuizProgress(progress: OpenQuizProgress) {
  localStorage.setItem(OPEN_QUIZ_PROGRESS_KEY, JSON.stringify({
    ...loadAll(),
    [progress.deckId]: progress
  }))
}

export function clearOpenQuizProgress(deckId: string) {
  const stored = loadAll()
  delete stored[deckId]

  if (Object.keys(stored).length === 0) {
    localStorage.removeItem(OPEN_QUIZ_PROGRESS_KEY)
  } else {
    localStorage.setItem(OPEN_QUIZ_PROGRESS_KEY, JSON.stringify(stored))
  }
}

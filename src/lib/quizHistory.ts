export const QUIZ_HISTORY_KEY = "odontoma_quiz_history_v1"
export const QUIZ_HISTORY_LIMIT = 3

export type QuizResponseRecord = {
  questionId: string
  question: string
  chapter?: string
  selectedAnswers: string[]
  correctAnswers: string[]
  explanation?: string
  isCorrect: boolean
  grade?: "incorrect" | "partial" | "correct" | "ungraded" | "unanswered"
}

export type QuizAttempt = {
  id: string
  title: string
  subject: string
  completedAt: string
  score: number
  total: number
  responses: QuizResponseRecord[]
  mode?: "multiple-choice" | "open-ended"
}

function isAttempt(value: unknown): value is QuizAttempt {
  if (!value || typeof value !== "object") return false
  const attempt = value as Partial<QuizAttempt>
  return typeof attempt.id === "string" &&
    typeof attempt.title === "string" &&
    typeof attempt.subject === "string" &&
    typeof attempt.completedAt === "string" &&
    typeof attempt.score === "number" &&
    typeof attempt.total === "number" &&
    Array.isArray(attempt.responses)
}

export function loadQuizHistory(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isAttempt).slice(0, QUIZ_HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function saveQuizAttempt(attempt: QuizAttempt) {
  const next = [
    attempt,
    ...loadQuizHistory().filter(item => item.id !== attempt.id)
  ].slice(0, QUIZ_HISTORY_LIMIT)

  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next))
  return next
}

export function removeQuizAttempt(attemptId: string) {
  const next = loadQuizHistory().filter(attempt => attempt.id !== attemptId)
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next))
  return next
}

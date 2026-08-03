export const QUIZ_HISTORY_KEY = "odontoma_quiz_history_v1"
export const QUIZ_HISTORY_LIMIT_PER_MODE = 7

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

function getAttemptMode(attempt: QuizAttempt) {
  return attempt.mode === "open-ended"
    ? "open-ended"
    : "multiple-choice"
}

function limitHistoryByMode(attempts: QuizAttempt[]) {
  const counts = {
    "multiple-choice": 0,
    "open-ended": 0
  }

  return attempts.filter(attempt => {
    const mode = getAttemptMode(attempt)

    if (counts[mode] >= QUIZ_HISTORY_LIMIT_PER_MODE) {
      return false
    }

    counts[mode] += 1
    return true
  })
}

export function loadQuizHistory(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return limitHistoryByMode(parsed.filter(isAttempt))
  } catch {
    return []
  }
}

export function saveQuizAttempt(attempt: QuizAttempt) {
  const next = [
    attempt,
    ...loadQuizHistory().filter(item => item.id !== attempt.id)
  ]

  const limited = limitHistoryByMode(next)

  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(limited))
  return limited
}

export function removeQuizAttempt(attemptId: string) {
  const next = loadQuizHistory().filter(attempt => attempt.id !== attemptId)
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next))
  return next
}

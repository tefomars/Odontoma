import { validateMixedContent, type MixedExam, type MixedQuestion } from "@/content/mixedExams/model"
import { shuffleArray } from "./shuffleQuestion"
import type { QuizAttempt, QuizResponseRecord } from "./quizHistory"
import { writeBrowserStorage, removeBrowserStorage } from "./storageSafety"

export type MixedGrade = "correct" | "partial" | "incorrect"
export type MixedAnswer = { text: string; selected: number[] }
export type MixedSession = {
  version: 1; id: string; exam: MixedExam; current: number; phase: "answering" | "grading"
  answers: Record<string, MixedAnswer>; grades: Record<string, MixedGrade>; checkedQuestionIds: string[]; startedAt: string
}
export const mixedSessionKey = (examId: string, retryId = "") => `odontoma_mixed_session_v1:${examId}:${retryId}`
export function createMixedSession(exam: MixedExam): MixedSession {
  const copy = structuredClone(exam)
  if (copy.shuffleQuestions) copy.questions = shuffleArray(copy.questions)
  copy.questions = copy.questions.map(q => {
    if (q.kind !== "choice") return q
    const order = shuffleArray(q.options.map((_, i) => i))
    return { ...q, options: order.map(i => q.options[i]), correctAnswers: order.flatMap((old, i) => q.correctAnswers.includes(old) ? [i] : []) }
  })
  return { version: 1, id: `mixed-attempt-${crypto.randomUUID()}`, exam: copy, current: 0, phase: "answering", answers: {}, grades: {}, checkedQuestionIds: [], startedAt: new Date().toISOString() }
}
/** Confirmed objective answers are immutable for the rest of this attempt. */
export function checkMixedAnswer(session: MixedSession, questionId: string): MixedSession {
  const q = session.exam.questions.find(q => q.id === questionId)
  if (session.phase !== "answering" || !q || q.kind === "written" || !mixedAnswerPresent(q, session.answers[q.id]) || session.checkedQuestionIds.includes(q.id)) return session
  return { ...session, checkedQuestionIds: [...session.checkedQuestionIds, q.id] }
}
export function updateMixedAnswer(session: MixedSession, questionId: string, answer: MixedAnswer): MixedSession {
  if (session.phase !== "answering" || session.checkedQuestionIds.includes(questionId) || !session.exam.questions.some(q => q.id === questionId)) return session
  return { ...session, answers: { ...session.answers, [questionId]: answer } }
}
export function mixedAnswerPresent(q: MixedQuestion, answer?: MixedAnswer) {
  return q.kind === "written" ? !!answer?.text.trim() : !!answer?.selected.length
}
export function mixedGrade(q: MixedQuestion, answer?: MixedAnswer, grade?: MixedGrade): QuizResponseRecord["grade"] {
  if (!mixedAnswerPresent(q, answer)) return "unanswered"
  if (q.kind === "written") return grade || "ungraded"
  const correct = q.kind === "choice" ? q.correctAnswers : [q.correct ? 0 : 1]
  return answer!.selected.length === correct.length && correct.every(i => answer!.selected.includes(i)) ? "correct" : "incorrect"
}
export function mixedAttempt(session: MixedSession): QuizAttempt {
  const responses: QuizResponseRecord[] = session.exam.questions.map(q => {
    const answer = session.answers[q.id], grade = mixedGrade(q, answer, session.grades[q.id])
    const options = q.kind === "choice" ? q.options : ["Verdadero", "Falso"]
    return { questionId: q.id, question: q.prompt, selectedAnswers: q.kind === "written" ? answer?.text.trim() ? [answer.text.trim()] : [] : (answer?.selected || []).map(i => options[i]), correctAnswers: q.kind === "written" ? [q.modelAnswer] : (q.kind === "choice" ? q.correctAnswers : [q.correct ? 0 : 1]).map(i => options[i]), acceptedPoints: q.kind === "written" ? q.acceptedPoints : undefined, image: q.image, imageAlt: q.imageAlt, backImage: q.backImage, backImageAlt: q.backImageAlt, explanation: q.explanation, isCorrect: grade === "correct", grade, mixedQuestion: q, responseKind: q.kind }
  })
  return { id: session.id, mode: "mixed", title: session.exam.title, subject: session.exam.subject, completedAt: new Date().toISOString(), score: responses.reduce((n, r) => n + (r.grade === "correct" ? 1 : r.grade === "partial" ? 0.5 : 0), 0), total: responses.length, responses }
}
export function prepareMixedRetry(attempt: QuizAttempt): { exam: MixedExam | null; error: string | null } {
  try {
    const incorrect = attempt.responses.filter(r => r.grade === "incorrect")
    if (!incorrect.length) return { exam: null, error: "Este intento no tiene preguntas incorrectas para repasar." }
    if (incorrect.some(r => !r.mixedQuestion)) return { exam: null, error: "Este intento antiguo no conserva todas las preguntas necesarias para reconstruir el repaso. Sus resultados siguen guardados; podés repetir el examen original." }
    const questions = incorrect.map(r => structuredClone(r.mixedQuestion!))
    const suffix = " · Incorrectas"
    const title = attempt.title.replace(/(?: · Incorrectas)+$/, "").slice(0, 180 - suffix.length).trimEnd() + suffix
    const exam: MixedExam = { id: `retry-${attempt.id}`, title, subject: attempt.subject, category: "", description: "Repaso independiente de este intento.", enabled: true, shuffleQuestions: true, questions }
    const errors = validateMixedContent({ version: 1, exams: [exam] })
    if (errors.length) return { exam: null, error: `No se pudo iniciar el repaso: ${errors.slice(0, 3).join(" ")} Si fue una prueba del Builder, completá esos campos y actualizá la vista previa. El intento original no se modificó.` }
    return { exam, error: null }
  } catch { return { exam: null, error: "No se pudo reconstruir el repaso de este intento. Tus resultados se conservan; actualizá la vista previa o abrí nuevamente el examen." } }
}
export const retryMixedExam = (attempt: QuizAttempt): MixedExam | null => prepareMixedRetry(attempt).exam
/** A stored snapshot preserves order and answer keys across refresh/content edits. */
export function loadMixedSession(key: string, examId: string): MixedSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null") as MixedSession | null
    if (!value || value.version !== 1 || value.exam?.id !== examId || !value.exam.questions.length || validateMixedContent({ version: 1, exams: [value.exam] }).length || !Number.isInteger(value.current) || value.current < 0 || value.current >= value.exam.questions.length || !["answering", "grading"].includes(value.phase) || typeof value.id !== "string" || typeof value.startedAt !== "string" || !value.answers || !value.grades) return null
    // Sessions saved before instant feedback keep their answers, without
    // pretending the student had already seen the correction.
    if (value.checkedQuestionIds === undefined) value.checkedQuestionIds = []
    if (!Array.isArray(value.checkedQuestionIds) || new Set(value.checkedQuestionIds).size !== value.checkedQuestionIds.length || value.checkedQuestionIds.some(id => !value.exam.questions.some(q => q.id === id && q.kind !== "written" && mixedAnswerPresent(q, value.answers[id])))) return null
    for (const q of value.exam.questions) {
      const a = value.answers[q.id], g = value.grades[q.id]
      const count = q.kind === "choice" ? q.options.length : 2
      if (a && (typeof a.text !== "string" || !Array.isArray(a.selected) || new Set(a.selected).size !== a.selected.length || a.selected.some(i => !Number.isInteger(i) || i < 0 || i >= count))) return null
      if (g && !["correct", "partial", "incorrect"].includes(g)) return null
    }
    return value
  } catch { return null }
}
export const saveMixedSession = (key: string, session: MixedSession) => writeBrowserStorage(key, JSON.stringify(session))
export const clearMixedSession = (key: string) => removeBrowserStorage(key)

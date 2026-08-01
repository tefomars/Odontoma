import { useEffect, useMemo, useState } from "react"

import logoImage from "@/assets/logo.png"

import QuizReviewScreen from "@/components/QuizReviewScreen"
import type {
  OpenQuizDeck,
  OpenQuizGrade,
  OpenQuizQuestion
} from "@/content/openQuizzes"
import {
  clearOpenQuizProgress,
  loadOpenQuizProgress,
  saveOpenQuizProgress
} from "@/lib/openQuizProgress"
import {
  saveQuizAttempt,
  type QuizAttempt,
  type QuizResponseRecord
} from "@/lib/quizHistory"

type Props = {
  deck: OpenQuizDeck
  onBack: () => void
  onMainMenu: () => void
  onHistory: () => void
}

type AnswersByQuestion = Record<string, string>
type GradesByQuestion = Record<string, OpenQuizGrade>

function shuffleQuestions(questions: OpenQuizQuestion[]) {
  const copy = [...questions]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }

  return copy
}

function isOpenQuizGrade(value: unknown): value is OpenQuizGrade {
  return value === "incorrect" || value === "partial" || value === "correct"
}

function createInitialSession(deck: OpenQuizDeck) {
  const saved = loadOpenQuizProgress(deck.id)
  const byId = new Map(deck.questions.map(question => [question.id, question]))
  const restoredQuestions = saved?.questionIds
    .map(id => byId.get(id))
    .filter((question): question is OpenQuizQuestion => Boolean(question))

  if (saved && restoredQuestions?.length === deck.questions.length) {
    const current = Math.max(0, Math.min(saved.current, restoredQuestions.length - 1))
    const currentQuestionId = restoredQuestions[current]?.id
    const answers: AnswersByQuestion = { ...(saved.answers || {}) }
    const gradesByQuestion: GradesByQuestion = { ...(saved.gradesByQuestion || {}) }

    for (const response of saved.responses || []) {
      if (response.selectedAnswers[0] && !answers[response.questionId]) {
        answers[response.questionId] = response.selectedAnswers[0]
      }
      if (isOpenQuizGrade(response.grade) && !gradesByQuestion[response.questionId]) {
        gradesByQuestion[response.questionId] = response.grade
      }
    }

    if (saved.studentAnswer && currentQuestionId && !answers[currentQuestionId]) {
      answers[currentQuestionId] = saved.studentAnswer
    }

    return {
      questions: restoredQuestions,
      current,
      answers,
      revealedQuestionIds: saved.revealedQuestionIds || (saved.revealed && currentQuestionId ? [currentQuestionId] : []),
      gradesByQuestion
    }
  }

  return {
    questions: shuffleQuestions(deck.questions),
    current: 0,
    answers: {} as AnswersByQuestion,
    revealedQuestionIds: [] as string[],
    gradesByQuestion: {} as GradesByQuestion
  }
}

function buildExplanation(question: OpenQuizQuestion) {
  return [
    question.acceptedPoints.length > 0
      ? `También se considera correcto mencionar:\n${question.acceptedPoints.map(point => `• ${point}`).join("\n")}`
      : "",
    question.explanation,
    question.source ? `Fuente: ${question.source}` : ""
  ].filter(Boolean).join("\n\n") || undefined
}

export default function OpenQuizSessionScreen({
  deck,
  onBack,
  onMainMenu,
  onHistory
}: Props) {
  const [initialSession] = useState(() => createInitialSession(deck))
  const [questions, setQuestions] = useState(initialSession.questions)
  const [current, setCurrent] = useState(initialSession.current)
  const [answers, setAnswers] = useState<AnswersByQuestion>(initialSession.answers)
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<string[]>(initialSession.revealedQuestionIds)
  const [gradesByQuestion, setGradesByQuestion] = useState<GradesByQuestion>(initialSession.gradesByQuestion)
  const [finished, setFinished] = useState(false)
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null)
  const [reviewing, setReviewing] = useState(false)

  const question = questions[current]
  const studentAnswer = question ? answers[question.id] || "" : ""
  const revealed = question ? revealedQuestionIds.includes(question.id) : false
  const currentGrade = question ? gradesByQuestion[question.id] : undefined
  const answered = Object.keys(gradesByQuestion).length
  const percentage = questions.length > 0
    ? Math.round((answered / questions.length) * 100)
    : 0

  const gradeCounts = useMemo(() => {
    const counts = { incorrect: 0, partial: 0, correct: 0 }
    Object.values(gradesByQuestion).forEach(grade => { counts[grade] += 1 })
    return counts
  }, [gradesByQuestion])

  const unanswered = questions.filter(item => !(answers[item.id] || "").trim()).length
  const ungraded = questions.filter(item => (answers[item.id] || "").trim() && !gradesByQuestion[item.id]).length
  const pending = questions.length - answered
  const firstOtherPending = questions.findIndex((item, index) =>
    index !== current && !gradesByQuestion[item.id])

  const summary = useMemo(() => [
    { label: "Correctas", value: gradeCounts.correct, color: "text-emerald-300" },
    { label: "Parciales", value: gradeCounts.partial, color: "text-amber-300" },
    { label: "Incorrectas", value: gradeCounts.incorrect, color: "text-rose-300" },
    { label: "Sin calificar", value: ungraded, color: "text-cyan-300" },
    { label: "No contestadas", value: unanswered, color: "text-zinc-300" }
  ], [gradeCounts, unanswered, ungraded])

  useEffect(() => {
    if (finished || questions.length === 0) return
    saveOpenQuizProgress({
      deckId: deck.id,
      questionIds: questions.map(item => item.id),
      current,
      answers,
      revealedQuestionIds,
      gradesByQuestion,
      savedAt: new Date().toISOString()
    })
  }, [answers, current, deck.id, finished, gradesByQuestion, questions, revealedQuestionIds])

  function updateStudentAnswer(value: string) {
    setAnswers(previous => ({ ...previous, [question.id]: value }))
  }

  function revealAnswer() {
    setRevealedQuestionIds(previous => previous.includes(question.id)
      ? previous
      : [...previous, question.id])
  }

  function gradeAnswer(grade: OpenQuizGrade) {
    setGradesByQuestion(previous => ({ ...previous, [question.id]: grade }))
  }

  function goNext() {
    if (current < questions.length - 1) {
      setCurrent(index => index + 1)
      return
    }

    if (firstOtherPending >= 0) setCurrent(firstOtherPending)
  }

  function finishSession() {
    if (pending > 0 && !window.confirm(`Todavía hay ${pending} ${pending === 1 ? "pregunta pendiente" : "preguntas pendientes"}. ¿Querés terminar y ver los resultados ahora?`)) {
      return
    }

    const responses: QuizResponseRecord[] = questions.map(item => {
      const answer = (answers[item.id] || "").trim()
      const grade = gradesByQuestion[item.id] || (answer ? "ungraded" : "unanswered")
      return {
        questionId: item.id,
        question: item.prompt,
        selectedAnswers: answer ? [answer] : [],
        correctAnswers: [item.modelAnswer],
        explanation: buildExplanation(item),
        isCorrect: grade === "correct",
        grade
      }
    })
    const attempt: QuizAttempt = {
      id: `open-quiz-attempt-${Date.now()}-${crypto.randomUUID()}`,
      title: deck.title,
      subject: deck.subject || "Preguntas abiertas",
      completedAt: new Date().toISOString(),
      score: gradeCounts.correct + gradeCounts.partial * 0.5,
      total: questions.length,
      responses,
      mode: "open-ended"
    }

    saveQuizAttempt(attempt)
    clearOpenQuizProgress(deck.id)
    setCompletedAttempt(attempt)
    setFinished(true)
  }

  function restart() {
    clearOpenQuizProgress(deck.id)
    setQuestions(shuffleQuestions(deck.questions))
    setCurrent(0)
    setAnswers({})
    setRevealedQuestionIds([])
    setGradesByQuestion({})
    setCompletedAttempt(null)
    setReviewing(false)
    setFinished(false)
  }

  function saveAndLeave(destination: () => void) {
    saveOpenQuizProgress({
      deckId: deck.id,
      questionIds: questions.map(item => item.id),
      current,
      answers,
      revealedQuestionIds,
      gradesByQuestion,
      savedAt: new Date().toISOString()
    })
    destination()
  }

  if (reviewing && completedAttempt) {
    return (
      <QuizReviewScreen
        attempt={completedAttempt}
        onBack={() => setReviewing(false)}
        onMainMenu={onMainMenu}
      />
    )
  }

  if (finished) {
    return (
      <main className="min-h-screen bg-[#09090b] p-5 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl items-center">
          <section className="w-full rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 text-center shadow-2xl shadow-black/30 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Sesión terminada</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{deck.title}</h1>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {summary.map(item => (
                <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <strong className={`block text-3xl ${item.color}`}>{item.value}</strong>
                  <span className="mt-1 block text-xs text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <button onClick={() => setReviewing(true)} className="rounded-2xl bg-emerald-400 px-6 py-3 font-black text-zinc-950 hover:bg-emerald-300">Ver todas las respuestas</button>
              <button onClick={restart} className="rounded-2xl bg-amber-300 px-6 py-3 font-black text-zinc-950 hover:bg-amber-200">Repetir</button>
              <button onClick={onHistory} className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 font-black text-cyan-200 hover:bg-cyan-500/20">Exámenes anteriores</button>
              <button onClick={onBack} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-black text-zinc-200 hover:bg-zinc-800">Ver apartados</button>
              <button onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 font-black text-violet-200 hover:bg-violet-500/20">Menú principal</button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (!question) return null

  const nextLabel = current === questions.length - 1 && firstOtherPending >= 0
    ? "Volver a una pendiente ↩"
    : currentGrade
      ? "Siguiente pregunta →"
      : "Omitir por ahora →"

  return (
    <main className="min-h-screen overflow-y-auto bg-[#09090b] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl pb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => saveAndLeave(onBack)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-black text-zinc-300 hover:text-white">💾 Guardar y salir</button>
            <button onClick={() => saveAndLeave(onMainMenu)} className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">Menú</button>
            <button onClick={finishSession} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-black text-rose-200 hover:bg-rose-500/20">Terminar ahora</button>
          </div>
          <div className="text-right text-sm font-black text-zinc-500">
            <span className="block">Pregunta {current + 1} de {questions.length}</span>
            <span className="text-xs text-zinc-600">{answered} calificadas · {pending} pendientes</span>
          </div>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${percentage}%` }} />
        </div>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] shadow-2xl shadow-black/30">
          <header className="border-b border-zinc-800 p-5 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <img src={logoImage} alt="Odontoma" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">{deck.subject || "Pregunta abierta"}</p>
                <p className="mt-1 text-xs text-zinc-500">{deck.title}</p>
              </div>
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">{question.prompt}</h1>
          </header>

          <div className="p-5 sm:p-8">
            <label className="block text-sm font-black text-zinc-300" htmlFor="open-answer">Tu respuesta</label>
            <textarea
              id="open-answer"
              value={studentAnswer}
              onChange={event => updateStudentAnswer(event.target.value)}
              disabled={revealed}
              placeholder="Escribí lo que recordarías en el examen…"
              className="mt-3 min-h-40 w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-950 p-4 leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-amber-400 disabled:opacity-80"
            />

            {!revealed ? (
              <button type="button" onClick={revealAnswer} disabled={!studentAnswer.trim()} className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-3.5 font-black text-zinc-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40">Mostrar criterio de corrección</button>
            ) : (
              <div className="mt-5 space-y-4">
                <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Respuesta modelo</p>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-100">{question.modelAnswer}</p>
                </section>

                {question.acceptedPoints.length > 0 && (
                  <section className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">También se considera correcto mencionar</p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-200">
                      {question.acceptedPoints.map(point => <li key={point} className="flex gap-2"><span className="text-amber-300">✓</span><span>{point}</span></li>)}
                    </ul>
                  </section>
                )}

                {(question.explanation || question.source) && (
                  <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
                    {question.explanation && <p className="leading-relaxed">{question.explanation}</p>}
                    {question.source && <p className="mt-3 font-black text-zinc-500">Fuente: {question.source}</p>}
                  </section>
                )}

                <div>
                  <p className="mb-3 text-center text-sm font-black text-zinc-300">Según tu criterio, ¿cómo estuvo tu respuesta?</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button onClick={() => gradeAnswer("incorrect")} className={`rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 font-black text-rose-200 hover:bg-rose-500/20 ${currentGrade === "incorrect" ? "ring-2 ring-rose-300" : ""}`}>Incorrecta</button>
                    <button onClick={() => gradeAnswer("partial")} className={`rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 font-black text-amber-200 hover:bg-amber-500/20 ${currentGrade === "partial" ? "ring-2 ring-amber-300" : ""}`}>Parcial</button>
                    <button onClick={() => gradeAnswer("correct")} className={`rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 font-black text-emerald-200 hover:bg-emerald-500/20 ${currentGrade === "correct" ? "ring-2 ring-emerald-300" : ""}`}>Correcta</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <nav className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setCurrent(index => index - 1)} disabled={current === 0} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 font-black text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35">← Pregunta anterior</button>
          <button type="button" onClick={goNext} disabled={current === questions.length - 1 && firstOtherPending < 0} className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 font-black text-amber-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-35">{nextLabel}</button>
        </nav>
      </div>
    </main>
  )
}

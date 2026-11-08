import { useState } from "react"

import {
  loadQuizHistory,
  removeQuizAttempt,
  type QuizAttempt
} from "@/lib/quizHistory"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onReview: (attempt: QuizAttempt) => void
  onRetryIncorrect: (attempt: QuizAttempt) => void
  subject?: string | null
}

export default function QuizHistoryScreen({ onBack, onMainMenu, onReview, onRetryIncorrect, subject }: Props) {
  const [attempts, setAttempts] = useState(loadQuizHistory)
  const [mode, setMode] = useState("all")
  const subjectAttempts = subject
    ? attempts.filter(attempt => attempt.subject === subject)
    : attempts
  const visibleAttempts = subjectAttempts.filter(a => mode === "all" || (a.mode || "multiple-choice") === mode)

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-200">← Atrás</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">Menú principal</button>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Historial local</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">{subject ? `Exámenes de ${subject}` : "Exámenes anteriores"}</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">{subject ? `Tus exámenes anteriores de ${subject} en este dispositivo.` : "Se conservan por separado los últimos 7 exámenes de opción múltiple, los últimos 7 escritos y los últimos 7 mixtos en este dispositivo."}</p>

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Tipo de examen en historial">{[["all","Todos"],["multiple-choice","Opción múltiple"],["open-ended","Escritos"],["mixed","Mixtos"]].map(([value,label])=><button key={value} aria-pressed={mode===value} onClick={()=>setMode(value)} className={`rounded-2xl border px-4 py-2 text-sm font-bold ${mode===value?"border-cyan-400 bg-cyan-500/15 text-cyan-200":"border-zinc-700 text-zinc-300"}`}>{label}</button>)}</div>
        {visibleAttempts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
            {subject ? `Todavía no has terminado un examen de ${subject}.` : "Todavía no has terminado ningún examen."}
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {visibleAttempts.map(attempt => (
              <article
                key={attempt.id}
                className="group flex flex-col gap-5 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-6 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{attempt.title}</p>
                  <p className="mt-2 text-xs text-zinc-400">{attempt.mode === "mixed" ? "Examen mixto" : attempt.mode === "open-ended" ? "Escrito" : "Opción múltiple"}</p>
                  <h2 className="mt-2 text-3xl font-black">{attempt.score}/{attempt.total}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completedAt))}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onReview(attempt)} className="rounded-2xl bg-white/10 px-5 py-3 font-black text-cyan-100">Ver respuestas →</button>
                  {attempt.responses.filter(response => response.grade === "incorrect" || (attempt.mode !== "open-ended" && attempt.mode !== "mixed" && !response.isCorrect)).length > 0 && (
                    <button type="button" onClick={() => onRetryIncorrect(attempt)} className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 font-black text-rose-100 hover:bg-rose-500/20">
                      Repasar incorrectas ({attempt.responses.filter(response => response.grade === "incorrect" || (attempt.mode !== "open-ended" && attempt.mode !== "mixed" && !response.isCorrect)).length})
                    </button>
                  )}
                  <button type="button" onClick={() => setAttempts(removeQuizAttempt(attempt.id))} className="rounded-2xl border border-red-500/20 px-4 py-3 text-sm font-black text-red-300 hover:bg-red-500/10">Quitar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

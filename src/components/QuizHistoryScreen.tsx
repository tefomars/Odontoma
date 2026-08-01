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
}

export default function QuizHistoryScreen({ onBack, onMainMenu, onReview }: Props) {
  const [attempts, setAttempts] = useState(loadQuizHistory)

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-200">← Atrás</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">Menú principal</button>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Historial local</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">Exámenes anteriores</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Se conservan los últimos 3 intentos terminados en este dispositivo.</p>

        {attempts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
            Todavía no has terminado ningún examen.
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {attempts.map(attempt => (
              <article
                key={attempt.id}
                className="group flex flex-col gap-5 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-6 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{attempt.title}</p>
                  <h2 className="mt-2 text-3xl font-black">{attempt.score}/{attempt.total}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completedAt))}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onReview(attempt)} className="rounded-2xl bg-white/10 px-5 py-3 font-black text-cyan-100">Ver respuestas →</button>
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

import type { QuizAttempt } from "@/lib/quizHistory"

type Props = {
  attempt: QuizAttempt
  onBack: () => void
  onMainMenu: () => void
}

export default function QuizReviewScreen({ attempt, onBack, onMainMenu }: Props) {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-200">← Atrás</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">Menú principal</button>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">Revisión del examen</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">Tus respuestas</h1>
            <p className="mt-3 text-zinc-400">{attempt.title} · {new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completedAt))}</p>
          </div>
          <div className="rounded-3xl border border-violet-500/30 bg-violet-500/10 px-6 py-4 text-center">
            <span className="text-sm font-bold text-violet-200">Resultado</span>
            <strong className="block text-3xl">{attempt.score}/{attempt.total}</strong>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {attempt.responses.map((response, index) => (
            <article key={`${response.questionId}-${index}`} className={`rounded-[2rem] border p-6 ${response.grade === "partial" ? "border-amber-500/30 bg-amber-500/5" : response.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Pregunta {index + 1}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${response.grade === "partial" ? "bg-amber-500/15 text-amber-300" : response.isCorrect ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{response.grade === "partial" ? "Parcial" : response.isCorrect ? "Correcta" : "Incorrecta"}</span>
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight">{response.question}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <AnswerBox title="Tu respuesta" answers={response.selectedAnswers} tone={response.grade === "partial" ? "partial" : response.isCorrect ? "correct" : "wrong"} />
                <AnswerBox title={attempt.mode === "open-ended" ? "Respuesta modelo" : "Respuesta correcta"} answers={response.correctAnswers} tone="correct" />
              </div>
              {response.explanation && <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Explicación</p><p className="mt-2 leading-relaxed text-zinc-300">{response.explanation}</p></div>}
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function AnswerBox({ title, answers, tone }: { title: string; answers: string[]; tone: "correct" | "partial" | "wrong" }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === "partial" ? "border-amber-500/25 bg-amber-500/10" : tone === "correct" ? "border-emerald-500/25 bg-emerald-500/10" : "border-red-500/25 bg-red-500/10"}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{title}</p>
      <ul className="mt-3 grid gap-2">
        {answers.length > 0 ? answers.map(answer => <li key={answer} className="font-semibold text-zinc-100">{answer}</li>) : <li className="text-zinc-500">Sin respuesta</li>}
      </ul>
    </div>
  )
}

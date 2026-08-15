import logoImage from "@/assets/logo.png"
import { chapters } from "@/content/histologia/chapters"
import { questions } from "@/content/histologia"
import {
  getPracticeQuestionIds,
  getProgressSummary,
  type ProgressQuestion
} from "@/lib/quizProgress"
import type { OdontomaStats } from "@/lib/stats"

type PracticeMode = "weak" | "unseen" | "recent"

type Props = {
  stats: OdontomaStats
  onBack: () => void
  onPractice: (mode: PracticeMode, chapterId?: string) => void
}

type TopicProgress = {
  tag: string
  questionCount: number
  coverage: number
  accuracy: number
  solid: number
  weak: number
  unseen: number
}

function getTopicProgress(
  chapterQuestions: ProgressQuestion[],
  stats: OdontomaStats
) {
  const topicQuestions = new Map<string, ProgressQuestion[]>()

  for (const question of chapterQuestions) {
    for (const tag of question.tags || []) {
      topicQuestions.set(tag, [
        ...(topicQuestions.get(tag) || []),
        question
      ])
    }
  }

  return Array.from(topicQuestions.entries())
    .map(([tag, taggedQuestions]): TopicProgress => {
      const uniqueQuestions = Array.from(
        new Map(taggedQuestions.map(question => [question.id, question])).values()
      )
      const summary = getProgressSummary(uniqueQuestions, stats)

      return {
        tag,
        questionCount: summary.total,
        coverage: summary.coverage,
        accuracy: summary.accuracy,
        solid: summary.solid,
        weak: summary.weak,
        unseen: summary.unseen
      }
    })
    .sort((a, b) => {
      if (a.weak !== b.weak) return b.weak - a.weak
      if (a.unseen !== b.unseen) return b.unseen - a.unseen
      if (a.coverage !== b.coverage) return a.coverage - b.coverage
      return a.accuracy - b.accuracy
    })
}

function topicAppearance(topic: TopicProgress) {
  if (topic.coverage === 0) {
    return {
      label: "Sin evaluar",
      card: "border-zinc-800 bg-zinc-950/70",
      text: "text-zinc-400"
    }
  }

  if (topic.weak > 0 || topic.accuracy < 60) {
    return {
      label: "Por reforzar",
      card: "border-rose-500/35 bg-rose-500/10",
      text: "text-rose-300"
    }
  }

  if (topic.solid === topic.questionCount) {
    return {
      label: "Sólido",
      card: "border-emerald-500/35 bg-emerald-500/10",
      text: "text-emerald-300"
    }
  }

  return {
    label: "En progreso",
    card: "border-amber-500/35 bg-amber-500/10",
    text: "text-amber-300"
  }
}

export default function WeakTopicsScreen({
  stats,
  onBack,
  onPractice
}: Props) {
  const global = getProgressSummary(questions, stats)
  const weakCount = getPracticeQuestionIds(questions, stats, "weak").length
  const unseenCount = getPracticeQuestionIds(questions, stats, "unseen").length
  const recentCount = getPracticeQuestionIds(questions, stats, "recent").length

  const actions = [
    {
      mode: "weak" as const,
      eyebrow: "Prioridad",
      title: "Reforzar puntos débiles",
      description: "Preguntas con bajo rendimiento o evidencia inestable.",
      count: weakCount,
      style: "border-rose-500/35 bg-rose-500/10 text-rose-200"
    },
    {
      mode: "recent" as const,
      eyebrow: "Reciente",
      title: "Corregir últimos errores",
      description: "Vuelve directamente a lo que fallaste la última vez.",
      count: recentCount,
      style: "border-amber-500/35 bg-amber-500/10 text-amber-200"
    },
    {
      mode: "unseen" as const,
      eyebrow: "Cobertura",
      title: "Evaluar contenido nuevo",
      description: "Avanza por preguntas que todavía no has contestado.",
      count: unseenCount,
      style: "border-sky-500/35 bg-sky-500/10 text-sky-200"
    }
  ]

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              <img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />
              Diagnóstico de quizzes
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Tu progreso</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-400 sm:text-base">
              Separa cuánto contenido conoces, qué tan bien respondes y qué temas ya demostraste varias veces.
            </p>
          </div>

          <button type="button" onClick={onBack} className="self-start rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-black text-zinc-200 hover:bg-zinc-800">
            ← Volver
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cobertura", `${global.coverage}%`, `${global.answered} de ${global.total} preguntas evaluadas`],
            ["Precisión", `${global.accuracy}%`, "Promedio de tu evidencia más reciente"],
            ["Sólidas", global.solid, "Acertadas repetidamente"],
            ["Por reforzar", global.weak, "Con error reciente o baja precisión"]
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-3xl border border-zinc-800 bg-[#111113] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
              <p className="mt-2 text-4xl font-black">{value}</p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-500">{detail}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Siguiente paso</p>
            <h2 className="mt-2 text-2xl font-black">¿Qué quieres practicar?</h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {actions.map(action => (
              <button key={action.mode} type="button" disabled={action.count === 0} onClick={() => onPractice(action.mode)} className={`rounded-3xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${action.style}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">{action.eyebrow}</p>
                  <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-black">{action.count}</span>
                </div>
                <h3 className="mt-5 text-xl font-black">{action.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed opacity-75">{action.description}</p>
                <p className="mt-4 text-sm font-black">Practicar hasta 20 →</p>
              </button>
            ))}
          </div>
        </section>

        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Mapa por capítulo</p>
          <h2 className="mt-2 text-3xl font-black">Dónde enfocar tu estudio</h2>
        </div>

        <div className="grid gap-4">
          {chapters.map(chapter => {
            const chapterQuestions = questions.filter(question => question.chapter === chapter.id)
            const summary = getProgressSummary(chapterQuestions, stats)
            const topics = getTopicProgress(chapterQuestions, stats)
            const chapterWeak = getPracticeQuestionIds(chapterQuestions, stats, "weak").length

            return (
              <details key={chapter.id} className="group rounded-[2rem] border border-zinc-800 bg-[#111113]">
                <summary className="cursor-pointer list-none p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">{chapter.id}</p>
                      <h3 className="mt-2 text-2xl font-black">{chapter.title}</h3>
                      <p className="mt-2 text-sm font-semibold text-zinc-500">Abrir diagnóstico de temas ↓</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
                      <div className="rounded-2xl bg-zinc-950 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Cobertura</p><p className="mt-1 text-xl font-black">{summary.coverage}%</p></div>
                      <div className="rounded-2xl bg-zinc-950 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Precisión</p><p className="mt-1 text-xl font-black">{summary.accuracy}%</p></div>
                      <div className="rounded-2xl bg-zinc-950 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Sólidas</p><p className="mt-1 text-xl font-black">{summary.solid}/{summary.total}</p></div>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-zinc-800 p-5 sm:p-6">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-zinc-400">{summary.weak} por reforzar · {summary.learning} en progreso · {summary.unseen} sin evaluar</p>
                    <button type="button" disabled={chapterWeak === 0} onClick={() => onPractice("weak", chapter.id)} className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-black text-rose-200 disabled:cursor-not-allowed disabled:opacity-40">
                      Practicar débiles de este capítulo ({chapterWeak})
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {topics.map(topic => {
                      const appearance = topicAppearance(topic)

                      return (
                        <div key={topic.tag} className={`rounded-2xl border p-4 ${appearance.card}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div><h4 className="font-black text-white">{topic.tag}</h4><p className={`mt-1 text-xs font-black uppercase tracking-wider ${appearance.text}`}>{appearance.label}</p></div>
                            <p className="text-lg font-black">{topic.accuracy}%</p>
                          </div>
                          <p className="mt-3 text-xs font-semibold text-zinc-500">Cobertura {topic.coverage}% · {topic.solid}/{topic.questionCount} sólidas</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </details>
            )
          })}
        </div>

        <p className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-semibold leading-relaxed text-zinc-500">
          “Sólida” requiere al menos dos aciertos consecutivos y 75% de precisión reciente. Los datos históricos anteriores siguen contando, pero las respuestas nuevas empiezan a priorizar lo reciente.
        </p>
      </div>
    </main>
  )
}

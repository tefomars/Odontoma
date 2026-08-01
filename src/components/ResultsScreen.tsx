type Props = {
  score: number
  total: number
  onReview: () => void
  onHistory: () => void
  onRestart: () => void
  onMainMenu: () => void
}

export default function ResultsScreen({
  score,
  total,
  onReview,
  onHistory,
  onRestart,
  onMainMenu
}: Props) {

  return (

    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">

      <div className="max-w-xl w-full bg-slate-900 rounded-3xl p-10 text-center">

        <h1 className="text-5xl font-black mb-6">
          Quiz terminado
        </h1>

        <p className="text-3xl mb-10">
          {score}/{total}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onReview}
            className="rounded-2xl bg-emerald-500 px-8 py-4 font-black text-black hover:bg-emerald-400 sm:col-span-2"
          >
            Ver todas las respuestas
          </button>

          <button
            onClick={onHistory}
            className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-8 py-4 font-black text-cyan-200 hover:bg-cyan-500/20"
          >
            Exámenes anteriores
          </button>

          <button
            onClick={onRestart}
            className="rounded-2xl border border-zinc-700 bg-zinc-800 px-8 py-4 font-black text-white hover:bg-zinc-700"
          >
            Nuevo examen
          </button>

          <button
            onClick={onMainMenu}
            className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-8 py-4 font-black text-violet-200 hover:bg-violet-500/20 sm:col-span-2"
          >
            Menú principal
          </button>
        </div>

      </div>

    </main>

  )
}

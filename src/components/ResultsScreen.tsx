type Props = {
  score: number
  total: number
  onRestart: () => void
  onMainMenu: () => void
}

export default function ResultsScreen({
  score,
  total,
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

        <div className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:justify-center
        ">
          <button
            onClick={onRestart}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black"
          >
            Volver
          </button>

          <button
            onClick={onMainMenu}
            className="border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 px-8 py-4 rounded-2xl font-black"
          >
            Menú principal
          </button>
        </div>

      </div>

    </main>

  )
}

type Props = {
  score: number
  total: number
  onRestart: () => void
}

export default function ResultsScreen({
  score,
  total,
  onRestart
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

        <button
          onClick={onRestart}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black"
        >
          Volver
        </button>

      </div>

    </main>

  )
}

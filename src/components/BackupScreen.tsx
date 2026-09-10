import BackupPanel from "@/components/BackupPanel"

type Props = {
  onBack: () => void
  onMainMenu: () => void
}

export default function BackupScreen({ onBack, onMainMenu }: Props) {
  return (
    <main className="min-h-screen bg-[#09090b] p-5 text-white sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl flex-col justify-center gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-black text-zinc-200 hover:bg-zinc-900"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="rounded-2xl border border-violet-500/50 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-200 hover:bg-violet-500/20"
          >
            Menú principal
          </button>
        </div>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">Tus datos</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Backup</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
            Guardá una copia de tu progreso, tus tarjetas, quizzes y configuraciones antes de cambiar de dispositivo o navegador.
          </p>
          <div className="mt-8">
            <BackupPanel />
          </div>
        </section>
      </div>
    </main>
  )
}

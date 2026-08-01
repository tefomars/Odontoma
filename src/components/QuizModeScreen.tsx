import logoImage from "@/assets/logo.png"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onSelectMultipleChoice: () => void
  onSelectOpenEnded: () => void
  onSelectMyQuizzes: () => void
}

export default function QuizModeScreen({
  onBack,
  onMainMenu,
  onSelectMultipleChoice,
  onSelectOpenEnded,
  onSelectMyQuizzes
}: Props) {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20"
          >
            ← Atrás
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-300 hover:bg-zinc-800"
          >
            Menú principal
          </button>
        </div>

        <header className="mb-10">
          <p className="mb-3 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-violet-300">
            <img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />
            Quizzes
          </p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            ¿Cómo querés responder?
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Elegí el tipo de práctica. Tus quizzes personales quedan disponibles abajo.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <QuizTypeCard
            label="Corrección automática"
            title="Opción múltiple"
            description="Elegí la respuesta correcta entre distractores y recibí el resultado al instante."
            symbol="A B C"
            color="violet"
            onClick={onSelectMultipleChoice}
          />
          <QuizTypeCard
            label="Respuesta libre"
            title="Respuestas abiertas"
            description="Escribí con tus palabras, compará con la respuesta modelo y calificá tu desempeño."
            symbol="✎"
            color="amber"
            onClick={onSelectOpenEnded}
          />
        </section>

        <section className="mt-8 border-t border-zinc-800 pt-8">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
            Tus herramientas
          </p>
          <button
            type="button"
            onClick={onSelectMyQuizzes}
            className="group w-full overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-left transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                  Crear e importar
                </p>
                <h2 className="mt-2 text-3xl font-black">My quizzes</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
                  Creá quizzes propios, importá preguntas desde texto o archivo y exportá cada deck.
                </p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl transition group-hover:rotate-12">
                →
              </div>
            </div>
          </button>
        </section>
      </div>
    </main>
  )
}

function QuizTypeCard({
  label,
  title,
  description,
  symbol,
  color,
  onClick
}: {
  label: string
  title: string
  description: string
  symbol: string
  color: "violet" | "amber"
  onClick: () => void
}) {
  const styles = color === "violet"
    ? {
        card: "border-violet-500/30 bg-violet-500/10 hover:border-violet-400/70 hover:bg-violet-500/20",
        label: "text-violet-300",
        symbol: "bg-violet-500/20 text-violet-100 ring-violet-400/30"
      }
    : {
        card: "border-amber-500/30 bg-amber-500/10 hover:border-amber-400/70 hover:bg-amber-500/20",
        label: "text-amber-300",
        symbol: "bg-amber-500/20 text-amber-100 ring-amber-400/30"
      }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[260px] rounded-[2rem] border p-7 text-left transition hover:scale-[1.01] ${styles.card}`}
    >
      <div className="mb-10 flex items-start justify-between gap-4">
        <span className={`grid min-h-14 min-w-14 place-items-center rounded-2xl px-3 text-sm font-black ring-1 ${styles.symbol}`}>
          {symbol}
        </span>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-2xl transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12">
          →
        </span>
      </div>
      <p className={`text-xs font-black uppercase tracking-[0.2em] ${styles.label}`}>
        {label}
      </p>
      <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 max-w-xl leading-relaxed text-zinc-300">{description}</p>
    </button>
  )
}

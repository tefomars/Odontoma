import logoImage from "@/assets/logo.png"

import type { OpenQuizDeck } from "@/content/openQuizzes"

type Props = {
  decks: OpenQuizDeck[]
  onBack: () => void
  onMainMenu: () => void
  onStart: (deckId: string) => void
}

export default function OpenQuizDecksScreen({
  decks,
  onBack,
  onMainMenu,
  onStart
}: Props) {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#09090b] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-black text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20"
          >
            Menú principal
          </button>
        </div>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 shadow-2xl shadow-black/30 sm:p-7 lg:p-9">
          <div className="mb-8 flex items-center gap-4">
            <img
              src={logoImage}
              alt="Odontoma"
              className="h-14 w-14 object-contain"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                Respuesta libre
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Preguntas abiertas
              </h1>
            </div>
          </div>

          <p className="mb-8 max-w-3xl text-base leading-relaxed text-zinc-400">
            Escribí tu respuesta, comparala con el criterio preparado y
            calificá honestamente tu desempeño.
          </p>

          {decks.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
              <p className="text-xl font-black text-zinc-200">
                Todavía no hay apartados
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Podés crearlos desde el editor local de contenido.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {decks.map(deck => (
                <button
                  key={deck.id}
                  type="button"
                  disabled={deck.questions.length === 0}
                  onClick={() => onStart(deck.id)}
                  className="group rounded-[1.5rem] border border-amber-500/25 bg-amber-500/5 p-6 text-left transition hover:border-amber-400/60 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:opacity-60"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-200">
                      {deck.subject || "General"}
                    </span>
                    <span className="text-sm font-black text-zinc-500">
                      {deck.questions.length} {deck.questions.length === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {deck.title}
                  </h2>
                  <p className="mt-3 min-h-10 text-sm leading-relaxed text-zinc-400">
                    {deck.description || "Práctica de respuesta libre."}
                  </p>
                  <p className="mt-6 text-sm font-black text-amber-200">
                    {deck.questions.length > 0 ? "Comenzar →" : "Agregá preguntas desde el builder"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

import { useMemo, useState } from "react"

import logoImage from "@/assets/logo.png"
import type { OpenQuizClass, OpenQuizDeck } from "@/content/openQuizzes"

type Props = {
  classes: OpenQuizClass[]
  decks: OpenQuizDeck[]
  onBack: () => void
  onMainMenu: () => void
  onStart: (deckId: string) => void
}

const DEFAULT_CLASS_SYMBOL = "▰"
const DEFAULT_CLASS_COLOR = "#fbbf24"

export default function OpenQuizDecksScreen({ classes: classDefinitions, decks, onBack, onMainMenu, onStart }: Props) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const classes = useMemo(() => {
    const grouped = new Map<string, OpenQuizDeck[]>()
    decks.forEach(deck => {
      const className = deck.subject.trim() || "General"
      grouped.set(className, [...(grouped.get(className) || []), deck])
    })
    const defined = classDefinitions.map(item => ({
      name: item.name,
      decks: grouped.get(item.name) || [],
      symbol: item.symbol,
      color: item.color
    }))
    const definedNames = new Set(classDefinitions.map(item => item.name))
    const legacy = [...grouped.entries()]
      .filter(([name]) => !definedNames.has(name))
      .map(([name, classDecks]) => ({
        name,
        decks: classDecks,
        symbol: classDecks[0]?.classSymbol || DEFAULT_CLASS_SYMBOL,
        color: classDecks[0]?.classColor || DEFAULT_CLASS_COLOR
      }))

    return [...defined, ...legacy]
  }, [classDefinitions, decks])
  const activeClass = classes.find(item => item.name === selectedClass)

  return (
    <main className="min-h-screen overflow-y-auto bg-[#09090b] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => activeClass ? setSelectedClass(null) : onBack()} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-black text-zinc-400 hover:bg-zinc-900 hover:text-white">
            ← {activeClass ? "Clases" : "Volver"}
          </button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20">
            Menú principal
          </button>
        </div>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 shadow-2xl shadow-black/30 sm:p-7 lg:p-9">
          <div className="mb-8 flex items-center gap-4">
            <img src={logoImage} alt="Odontoma" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">{activeClass ? "Clase" : "Respuesta libre"}</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{activeClass?.name || "Elegí una clase"}</h1>
            </div>
          </div>

          <p className="mb-8 max-w-3xl text-base leading-relaxed text-zinc-400">
            {activeClass
              ? "Elegí el examen o apartado que querés practicar."
              : "Tus preguntas abiertas están organizadas por materia para que encuentres cada examen más rápido."}
          </p>

          {classes.length === 0 ? (
            <EmptyState />
          ) : activeClass ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeClass.decks.map(deck => (
                <DeckCard key={deck.id} deck={deck} classColor={activeClass.color} onStart={onStart} />
              ))}
            </div>
          ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {classes.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedClass(item.name)}
                    className="group rounded-[1.5rem] border p-6 text-left transition hover:scale-[1.01]"
                    style={{
                      borderColor: `${item.color}45`,
                      backgroundColor: `${item.color}0D`
                    }}
                  >
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <span
                        className="grid h-12 w-12 place-items-center rounded-2xl border text-2xl"
                        style={{
                          color: item.color,
                          borderColor: `${item.color}35`,
                          backgroundColor: `${item.color}20`
                        }}
                      >
                        {item.symbol}
                      </span>
                      <span className="text-sm font-black uppercase tracking-wider text-zinc-500">Clase</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">{item.name}</h2>
                    <p className="mt-3 text-sm text-zinc-400">{item.decks.length} {item.decks.length === 1 ? "cuestionario disponible" : "cuestionarios disponibles"}</p>
                    <p className="mt-6 text-sm font-black" style={{ color: item.color }}>Abrir carpeta →</p>
                  </button>
                ))}
              </div>
          )}
        </section>
      </div>
    </main>
  )
}

function DeckCard({ deck, classColor, onStart }: { deck: OpenQuizDeck; classColor: string; onStart: (deckId: string) => void }) {
  const color = deck.color || classColor || DEFAULT_CLASS_COLOR

  return (
    <button
      type="button"
      disabled={deck.questions.length === 0}
      onClick={() => onStart(deck.id)}
      className="group rounded-[1.5rem] border p-6 text-left transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:opacity-60"
      style={{ borderColor: `${color}45`, backgroundColor: `${color}0D` }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span
          className="rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider"
          style={{ color, backgroundColor: `${color}20` }}
        >
          Respuesta libre
        </span>
        <span className="text-sm font-black text-zinc-500">{deck.questions.length} {deck.questions.length === 1 ? "pregunta" : "preguntas"}</span>
      </div>
      <h2 className="text-2xl font-black tracking-tight">{deck.title}</h2>
      <p className="mt-3 min-h-10 text-sm leading-relaxed text-zinc-400">{deck.description || "Práctica de respuesta libre."}</p>
      <p className="mt-6 text-sm font-black" style={{ color }}>{deck.questions.length > 0 ? "Comenzar →" : "Agregá preguntas desde el builder"}</p>
    </button>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
      <p className="text-xl font-black text-zinc-200">Todavía no hay clases</p>
      <p className="mt-2 text-sm text-zinc-500">Creá un apartado y escribí su materia desde el editor local.</p>
    </div>
  )
}

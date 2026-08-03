import { useMemo, useRef, useState } from "react"

import logoImage from "@/assets/logo.png"

import {
  createUserQuizDeck,
  deleteUserQuizDeck,
  exportUserQuizBundle,
  getUserQuizDeckMode,
  getUserQuizQuestionsByDeck,
  importUserQuizBundle,
  loadUserQuizDecks,
  type UserQuizDeck,
  type UserQuizMode
} from "@/lib/userQuizzes"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onSelectDeck: (deckId: string) => void
  onEditDeck: (deckId: string) => void
  onPracticeDeck: (deckId: string) => void
}

type StudioAction = "create" | "import" | null

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "quiz"
}

function downloadQuiz(deck: UserQuizDeck) {
  const bundle = exportUserQuizBundle(deck.id)
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/vnd.odontoma.quiz+json"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${safeFileName(deck.name)}.odontoma-quiz`
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export default function MyQuizDecksScreen({
  onBack,
  onMainMenu,
  onSelectDeck,
  onEditDeck,
  onPracticeDeck
}: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [mode, setMode] = useState<UserQuizMode>("multiple-choice")
  const [activeAction, setActiveAction] = useState<StudioAction>(null)
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const decks = useMemo(() => {
    void refreshKey
    const query = search.trim().toLocaleLowerCase("es")

    return [...loadUserQuizDecks()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter(deck => !query || `${deck.name} ${deck.description || ""}`
        .toLocaleLowerCase("es")
        .includes(query))
  }, [refreshKey, search])

  function refresh() {
    setRefreshKey(value => value + 1)
  }

  function createDeck() {
    if (!name.trim()) return

    const deck = createUserQuizDeck({ name, description, mode })
    setName("")
    setDescription("")
    setMode("multiple-choice")
    setActiveAction(null)
    setMessage(`“${deck.name}” creado. Agregá su primera pregunta.`)
    setError(null)
    refresh()
    onEditDeck(deck.id)
  }

  function deleteDeck(deck: UserQuizDeck) {
    if (!window.confirm(`¿Borrar “${deck.name}” y todas sus preguntas?`)) return
    deleteUserQuizDeck(deck.id)
    setMessage(`“${deck.name}” fue eliminado.`)
    setError(null)
    refresh()
  }

  async function importFile(file?: File) {
    if (!file) return

    try {
      const result = importUserQuizBundle(await file.text())
      setMessage(`“${result.deck.name}” importado con ${result.questions.length} preguntas.`)
      setError(null)
      setActiveAction(null)
      refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo importar el quiz.")
      setMessage(null)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function shareDeck(deck: UserQuizDeck) {
    const bundle = exportUserQuizBundle(deck.id)

    try {
      if (typeof File !== "undefined" && navigator.share && navigator.canShare) {
        const file = new File(
          [JSON.stringify(bundle, null, 2)],
          `${safeFileName(deck.name)}.odontoma-quiz`,
          { type: "application/json" }
        )

        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: deck.name,
              text: `Quiz de Odontoma: ${deck.name}`,
              files: [file]
            })
            setMessage(`“${deck.name}” se compartió correctamente.`)
            setError(null)
            return
          } catch (caught) {
            if (caught instanceof DOMException && caught.name === "AbortError") return
            // Some desktop and embedded browsers report file sharing support but
            // still reject the native dialog. Downloading remains a reliable path.
          }
        }
      }

      downloadQuiz(deck)
      setMessage(`“${deck.name}” se descargó. Enviá el archivo por WhatsApp, AirDrop, correo o Drive.`)
      setError(null)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return
      setError("No se pudo preparar el archivo. Volvé a intentarlo.")
      setMessage(null)
    }
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[#09090b] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap justify-between gap-2">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-black text-zinc-400 hover:bg-zinc-900 hover:text-white">← Volver</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20">Menú principal</button>
        </div>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 shadow-2xl shadow-black/30 sm:p-7 lg:p-8">
          <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <img src={logoImage} alt="Odontoma" className="h-12 w-12 object-contain" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Creación local</p>
                <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Quiz Studio</h1>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400 md:text-right">Creá, importá y compartí cuestionarios. Todo queda guardado solamente en este dispositivo.</p>
          </header>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => setActiveAction(current => current === "create" ? null : "create")} className={`rounded-[1.5rem] border p-5 text-left transition ${activeAction === "create" ? "border-violet-400 bg-violet-500/20" : "border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15"}`}>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Nuevo</span>
              <strong className="mt-2 block text-2xl">＋ Crear quiz</strong>
              <span className="mt-2 block text-sm text-zinc-400">Opción múltiple o respuesta escrita.</span>
            </button>
            <button type="button" onClick={() => setActiveAction(current => current === "import" ? null : "import")} className={`rounded-[1.5rem] border p-5 text-left transition ${activeAction === "import" ? "border-cyan-400 bg-cyan-500/20" : "border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15"}`}>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Compartido</span>
              <strong className="mt-2 block text-2xl">⇩ Importar quiz</strong>
              <span className="mt-2 block text-sm text-zinc-400">Abrí un archivo .odontoma-quiz.</span>
            </button>
          </div>

          {activeAction === "create" && (
            <section className="mt-4 rounded-[1.5rem] border border-violet-500/30 bg-black/20 p-5" onKeyDown={event => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") createDeck()
            }}>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <label className="grid gap-2 text-sm font-black text-zinc-300">Nombre *<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Ej: Microbiología parcial 2" className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-medium text-white outline-none focus:border-violet-400" /></label>
                <label className="grid gap-2 text-sm font-black text-zinc-300">Descripción<input value={description} onChange={event => setDescription(event.target.value)} placeholder="Tema, capítulo o indicaciones" className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-medium text-white outline-none focus:border-violet-400" /></label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ModeButton active={mode === "multiple-choice"} color="violet" title="Opción múltiple" subtitle="Opciones y corrección automática" onClick={() => setMode("multiple-choice")} />
                <ModeButton active={mode === "open-ended"} color="amber" title="Respuesta escrita" subtitle="Respuesta modelo y autoevaluación" onClick={() => setMode("open-ended")} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-zinc-500">Atajo: ⌘/Ctrl + Enter</span>
                <button type="button" disabled={!name.trim()} onClick={createDeck} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500">Crear y agregar preguntas →</button>
              </div>
            </section>
          )}

          {activeAction === "import" && (
            <section className="mt-4 rounded-[1.5rem] border border-cyan-500/30 bg-black/20 p-5">
              <input ref={fileInputRef} type="file" accept=".odontoma-quiz,.json,application/json" onChange={event => void importFile(event.target.files?.[0])} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-[1.25rem] border border-dashed border-cyan-400/40 bg-cyan-500/5 p-8 text-center hover:bg-cyan-500/10">
                <strong className="block text-xl text-cyan-100">Elegir archivo compartido</strong>
                <span className="mt-2 block text-sm text-zinc-400">La importación crea una copia y nunca sobrescribe tus quizzes.</span>
              </button>
            </section>
          )}

          {(message || error) && <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${error ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>{error || message}</p>}

          <section className="mt-8 border-t border-zinc-800 pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Biblioteca local</p>
                <h2 className="mt-2 text-3xl font-black">Mis quizzes</h2>
                <p className="mt-1 text-sm text-zinc-500">{loadUserQuizDecks().length} guardados en este dispositivo</p>
              </div>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar quiz…" className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 sm:w-72" />
            </div>

            {decks.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center">
                <p className="text-xl font-black">{search ? "No encontramos ese quiz" : "Todavía no tenés quizzes personales"}</p>
                <p className="mt-2 text-sm text-zinc-500">{search ? "Probá con otro nombre." : "Creá el primero o importá uno de un compañero."}</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {decks.map(deck => {
                  const count = getUserQuizQuestionsByDeck(deck.id).length
                  const deckMode = getUserQuizDeckMode(deck)
                  return (
                    <article key={deck.id} className="flex min-h-72 flex-col rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">
                      <button type="button" onClick={() => onSelectDeck(deck.id)} className="text-left">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${deckMode === "open-ended" ? "bg-amber-500/15 text-amber-300" : "bg-violet-500/15 text-violet-300"}`}>{deckMode === "open-ended" ? "Respuesta escrita" : "Opción múltiple"}</span>
                        <h3 className="mt-4 text-2xl font-black tracking-tight">{deck.name}</h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-zinc-400">{deck.description || "Quiz personal de Odontoma."}</p>
                      </button>
                      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500"><span>{count} {count === 1 ? "pregunta" : "preguntas"}</span><span>{new Intl.DateTimeFormat("es-GT", { dateStyle: "medium" }).format(new Date(deck.updatedAt))}</span></div>
                      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                        <button type="button" disabled={count === 0} onClick={() => onPracticeDeck(deck.id)} className="rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500">Practicar</button>
                        <button type="button" onClick={() => onEditDeck(deck.id)} className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-sm font-black text-violet-200">Editar</button>
                        <button type="button" onClick={() => void shareDeck(deck)} className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-sm font-black text-cyan-200">Compartir</button>
                        <button type="button" onClick={() => deleteDeck(deck)} className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm font-black text-red-300">Eliminar</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

function ModeButton({ active, color, title, subtitle, onClick }: { active: boolean; color: "violet" | "amber"; title: string; subtitle: string; onClick: () => void }) {
  const activeClass = color === "amber"
    ? "border-amber-400 bg-amber-500/15"
    : "border-violet-400 bg-violet-500/15"

  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left ${active ? activeClass : "border-zinc-800 bg-zinc-950"}`}>
      <strong className="block">{title}</strong>
      <span className="mt-1 block text-xs text-zinc-500">{subtitle}</span>
    </button>
  )
}

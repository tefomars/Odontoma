import { useState } from "react"
import {
  citoIIPrePartialFlashcards,
  citoIIPrePartialQuestions
} from "@/content/prePartial/citoII"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onStartMultipleChoice: (amount: number, preference: ReviewMode) => void
  onStartFlashcards: (amount: number, preference: ReviewMode) => void
  onResetPartial: () => void
}

const classes = [
  { title: "Citohistología", description: "Capítulos, tejidos y sistemas.", accentColor: "#a78bfa", symbol: "⌬" }
]

const partials = ["Parcial 2 · Cito II"]
const reviewAmounts = [10, 20] as const
type ReviewType = "Opción múltiple" | "Flashcards esenciales"
type ReviewPreference = "Nuevas" | "Incorrectas" | "Mezcla"
type ReviewMode = "new" | "incorrect" | "mixed"

export default function PrePartialReviewScreen({ onBack, onMainMenu, onStartMultipleChoice, onStartFlashcards, onResetPartial }: Props) {
  const [selectedClass, setSelectedClass] = useState<(typeof classes)[number] | null>(null)
  const [reviewType, setReviewType] = useState<ReviewType | null>(null)
  const [selectedPreference, setSelectedPreference] = useState<ReviewPreference>("Mezcla")

  function closeDialog() {
    setSelectedClass(null)
    setReviewType(null)
  }

  function pageBack() {
    if (selectedClass) {
      closeDialog()
      return
    }
    onBack()
  }

  function startReview(amount: number) {
    if (!reviewType) return

    const preference =
      selectedPreference === "Nuevas"
        ? "new"
        : selectedPreference === "Incorrectas"
          ? "incorrect"
          : "mixed"

    if (reviewType === "Opción múltiple") {
      onStartMultipleChoice(amount, preference)
      return
    }

    onStartFlashcards(amount, preference)
  }

  return (
    <main className="min-h-screen bg-[#09090b] p-5 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={pageBack} className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-black text-zinc-200 hover:bg-zinc-900">← Volver</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-violet-500/50 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-200 hover:bg-violet-500/20">Menú principal</button>
        </div>

        <section className="mt-6 rounded-[2rem] border border-amber-400/20 bg-[#111113] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Última vuelta</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Repaso pre-parcial</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {selectedClass ? `${selectedClass.title} · ${reviewType}. Elegí el parcial y cuánto querés repasar.` : "Elegí la clase. Cada banco será exclusivo para la última vuelta antes del parcial, sin repetir preguntas de los quizzes ni las tarjetas."}
          </p>

          {!selectedClass ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {classes.map(item => (
                <ClassBank
                  key={item.title}
                  {...item}
                  multipleChoiceCount={citoIIPrePartialQuestions.length}
                  flashcardCount={citoIIPrePartialFlashcards.length}
                  onSelect={type => {
                  setSelectedClass(item)
                  setReviewType(type)
                }} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {partials.map((partial, index) => (
                <article key={partial} className="rounded-3xl border border-zinc-700 bg-zinc-950 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: selectedClass.accentColor }}>Bloque {index + 1}</p>
                  <h2 className="mt-3 text-2xl font-black">{partial}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Banco exclusivo de {reviewType?.toLowerCase()} · {reviewType === "Opción múltiple" ? citoIIPrePartialQuestions.length : citoIIPrePartialFlashcards.length} {reviewType === "Opción múltiple" ? "preguntas" : "flashcards"}.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {(["Nuevas", "Incorrectas", "Mezcla"] as ReviewPreference[]).map(preference => (
                      <button
                        key={preference}
                        type="button"
                        onClick={() => setSelectedPreference(preference)}
                        className="rounded-full border px-3 py-2 text-xs font-black transition"
                        style={{
                          borderColor: selectedPreference === preference ? selectedClass.accentColor : "#3f3f46",
                          color: selectedPreference === preference ? selectedClass.accentColor : "#a1a1aa",
                          backgroundColor: selectedPreference === preference ? `${selectedClass.accentColor}18` : "#09090b"
                        }}
                      >
                        {preference}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {reviewAmounts.map(amount => (
                      <button key={amount} type="button" onClick={() => startReview(amount)} className="rounded-xl border px-2 py-3 text-sm font-black transition hover:brightness-125" style={{ borderColor: `${selectedClass.accentColor}88`, color: selectedClass.accentColor, backgroundColor: `${selectedClass.accentColor}14` }}>
                        Repasar {amount}
                      </button>
                    ))}
                    <button type="button" onClick={() => startReview(reviewType === "Opción múltiple" ? citoIIPrePartialQuestions.length : citoIIPrePartialFlashcards.length)} className="rounded-xl border px-2 py-3 text-sm font-black transition hover:brightness-125" style={{ borderColor: `${selectedClass.accentColor}88`, color: selectedClass.accentColor, backgroundColor: `${selectedClass.accentColor}14` }}>
                      Todas
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onResetPartial}
                    className="mt-5 w-full rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/20"
                  >
                    ↺ Reiniciar progreso de este parcial
                  </button>
                  <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">
                    Solo borra el avance de este banco: nuevas, incorrectas, flashcards e intentos.
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

    </main>
  )
}

function ClassBank({
  symbol,
  title,
  description,
  accentColor,
  multipleChoiceCount,
  flashcardCount,
  onSelect
}: {
  symbol: string
  title: string
  description: string
  accentColor: string
  multipleChoiceCount: number
  flashcardCount: number
  onSelect: (type: ReviewType) => void
}) {
  return (
    <article className="rounded-3xl border p-6" style={{ borderColor: `${accentColor}44`, backgroundColor: `${accentColor}0d` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border px-3 py-2 text-sm font-black" style={{ borderColor: `${accentColor}66`, color: accentColor, backgroundColor: `${accentColor}18` }}>{symbol}</div>
        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-black text-zinc-400">Banco exclusivo</span>
      </div>
      <h2 className="mt-6 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onSelect("Opción múltiple")} className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-black text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">A B C<br /><span className="text-xs font-semibold">Opción múltiple · {multipleChoiceCount}</span></button>
        <button type="button" onClick={() => onSelect("Flashcards esenciales")} className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-black text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">↻<br /><span className="text-xs font-semibold">Flashcards · {flashcardCount}</span></button>
      </div>
    </article>
  )
}

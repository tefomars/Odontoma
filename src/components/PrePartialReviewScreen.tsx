import { useEffect, useState } from "react"
import { reviewClassPresentation } from "@/content/appBuilder/organization"
import { getCumulativePrePartialBank, prePartialBanks } from "@/content/prePartial/banks"

import FlashcardStudyModeSwitch from "./flashcards/FlashcardStudyModeSwitch"
import { useFlashcardStudyMode } from "@/lib/flashcardStudyMode"
import { subscribeStudyProgress } from "@/lib/studyProgressEvents"
import { countPrePartialProgress, loadPrePartialPreferences, prePartialPreferenceKey, readPrePartialProgress, savePrePartialPreference, PREPARTIAL_PREFERENCES_KEY } from "@/lib/prePartialProgress"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onStartMultipleChoice: (partial: string, amount: number, preference: ReviewMode) => void
  onStartFlashcards: (partial: string, amount: number, preference: ReviewMode) => void
  onResetPartial: (partial: string) => void
  pausedPartial?: string | null
  onContinuePartial: () => void
  initialReviewType?: ReviewType | null
  initialSubject?: string | null
  onClassChange?: (subject: string) => void
  onReviewTypeChange: (type: ReviewType | null) => void
}

const classes = [...new Set(prePartialBanks.map(bank => bank.subject))].map(subject => ({ subject, ...reviewClassPresentation(subject), accentColor: reviewClassPresentation(subject).color }))

const reviewAmounts = [10, 20] as const
type ReviewType = "Opción múltiple" | "Flashcards esenciales"
type ReviewMode = "new" | "incorrect" | "mixed"
const reviewPreferences = [{ value: "new", label: "Nuevas" }, { value: "incorrect", label: "Incorrectas" }, { value: "mixed", label: "Mezcla" }] as const

export default function PrePartialReviewScreen({ onBack, onMainMenu, onStartMultipleChoice, onStartFlashcards, onResetPartial, pausedPartial, onContinuePartial, initialReviewType = null, onReviewTypeChange, initialSubject, onClassChange }: Props) {
  const [selectedClass, setSelectedClass] = useState<(typeof classes)[number] | null>(
    initialReviewType ? classes.find(c => c.subject === initialSubject) || classes[0] : null
  )
  const [reviewType, setReviewType] = useState<ReviewType | null>(initialReviewType)
  const [preferences, setPreferences] = useState(loadPrePartialPreferences)
  const [studyMode] = useFlashcardStudyMode()
  const [, refreshProgress] = useState(0)
  const kind = reviewType === "Flashcards esenciales" ? "flashcards" : "questions"
  const progress = readPrePartialProgress(kind, studyMode)
  useEffect(() => subscribeStudyProgress([
    "odontoma_stats", "odontoma_fsrs_storage", "odontoma_free_flashcard_progress_v1", PREPARTIAL_PREFERENCES_KEY,
  ], () => {
    refreshProgress(version => version + 1)
    setPreferences(loadPrePartialPreferences())
  }), [])

  function preferenceFor(bankId: string): ReviewMode {
    return preferences[prePartialPreferenceKey(bankId, kind)] || "mixed"
  }

  function choosePreference(bankId: string, preference: ReviewMode) {
    if (savePrePartialPreference(bankId, kind, preference)) setPreferences(loadPrePartialPreferences())
  }

  function progressCounter(bank: (typeof prePartialBanks)[number]) {
    const counts = countPrePartialProgress(bank, kind, studyMode, progress)
    return <div className="mt-3 min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2" aria-label={`Progreso de ${bank.title}`}>
      <p className="text-sm font-black text-zinc-200">{counts.done}/{counts.total} {kind === "questions" ? "preguntas hechas" : "tarjetas repasadas"}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{counts.new} nuevas · {counts.incorrect} incorrectas{kind === "flashcards" ? ` · ${studyMode === "free" ? "Solo flashcards" : "Repetición espaciada"}` : ""}</p>
    </div>
  }
  const finalBank = selectedClass && reviewType === "Opción múltiple"
    ? getCumulativePrePartialBank(selectedClass.subject)
    : undefined

  function closeDialog() {
    setSelectedClass(null)
    setReviewType(null)
    onReviewTypeChange(null)
  }

  function pageBack() {
    if (selectedClass) {
      closeDialog()
      return
    }
    onBack()
  }

  function startReview(partial: string, amount: number) {
    if (!reviewType) return

    const preference = preferenceFor(partial)

    if (reviewType === "Opción múltiple") {
      onStartMultipleChoice(partial, amount, preference)
      return
    }

    onStartFlashcards(partial, amount, preference)
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
                  multipleChoiceCount={prePartialBanks.filter(b => b.subject === item.subject).reduce((count, bank) => count + bank.questions.length, 0)}
                  flashcardCount={prePartialBanks.filter(b => b.subject === item.subject).reduce((count, bank) => count + bank.flashcards.length, 0)}
                  onSelect={type => {
                    setSelectedClass(item)
                    onClassChange?.(item.subject)
                    setReviewType(type)
                    onReviewTypeChange(type)
                  }} />
              ))}
            </div>
          ) : (
            <>{reviewType === "Flashcards esenciales" && <div className="mt-8"><FlashcardStudyModeSwitch/></div>}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {prePartialBanks.filter(bank => bank.subject === selectedClass.subject && (reviewType === "Opción múltiple" || bank.flashcards.length > 0)).map(bank => (
                <article key={bank.id} className="rounded-3xl border border-zinc-700 bg-zinc-950 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: selectedClass.accentColor }}>{selectedClass.title}</p>
                  <h2 className="mt-3 text-2xl font-black">{bank.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Banco exclusivo de {reviewType?.toLowerCase()} · {reviewType === "Opción múltiple" ? bank.questions.length : bank.flashcards.length} {reviewType === "Opción múltiple" ? "preguntas" : "flashcards"}.
                  </p>
                  {progressCounter(bank)}
                  {reviewType === "Opción múltiple" && pausedPartial === bank.id && (
                    <button type="button" onClick={onContinuePartial} className="mt-4 w-full rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-3 text-sm font-black text-emerald-200 hover:bg-emerald-500/20">
                      Continuar examen guardado
                    </button>
                  )}
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {reviewPreferences.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={preferenceFor(bank.id) === value}
                        onClick={() => choosePreference(bank.id, value)}
                        className="rounded-full border px-3 py-2 text-xs font-black transition"
                        style={{
                          borderColor: preferenceFor(bank.id) === value ? selectedClass.accentColor : "#3f3f46",
                          color: preferenceFor(bank.id) === value ? selectedClass.accentColor : "#a1a1aa",
                          backgroundColor: preferenceFor(bank.id) === value ? `${selectedClass.accentColor}18` : "var(--background)"
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {reviewAmounts.map(amount => (
                      <button key={amount} type="button" onClick={() => startReview(bank.id, amount)} className="rounded-xl border px-2 py-3 text-sm font-black transition hover:brightness-125" style={{ borderColor: `${selectedClass.accentColor}88`, color: selectedClass.accentColor, backgroundColor: `${selectedClass.accentColor}14` }}>
                        Repasar {amount}
                      </button>
                    ))}
                    <button type="button" onClick={() => startReview(bank.id, reviewType === "Opción múltiple" ? bank.questions.length : bank.flashcards.length)} className="rounded-xl border px-2 py-3 text-sm font-black transition hover:brightness-125" style={{ borderColor: `${selectedClass.accentColor}88`, color: selectedClass.accentColor, backgroundColor: `${selectedClass.accentColor}14` }}>
                      Todas
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResetPartial(bank.id)}
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
            {finalBank && (
              <article className="mt-6 rounded-3xl border border-amber-400/40 bg-amber-500/5 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Final del semestre</p>
                <h2 className="mt-3 break-words text-2xl font-black">{finalBank.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Mezcla de los {finalBank.chapters.length} parciales seleccionados para este semestre · {finalBank.questions.length} preguntas de opción múltiple y V/F.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Incluye: {finalBank.chapters.map(chapter => chapter.title).join(" · ")}. Se reparten preguntas entre los parciales con contenido disponible, sin repetirlas dentro del intento.
                </p>
                {progressCounter(finalBank)}
                {pausedPartial === finalBank.id && (
                  <button type="button" onClick={onContinuePartial} className="mt-4 w-full rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-3 text-sm font-black text-emerald-200 hover:bg-emerald-500/20">Continuar examen final guardado</button>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {reviewPreferences.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => choosePreference(finalBank.id, value)} aria-pressed={preferenceFor(finalBank.id) === value} className={`rounded-full border px-3 py-2 text-xs font-black ${preferenceFor(finalBank.id) === value ? "border-amber-300 bg-amber-500/15 text-amber-200" : "border-zinc-700 text-zinc-400"}`}>{label}</button>
                  ))}
                </div>
                <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2">
                  {reviewAmounts.map(amount => <button key={amount} type="button" onClick={() => startReview(finalBank.id, amount)} className="rounded-xl border border-amber-400/50 bg-amber-500/10 px-2 py-3 text-sm font-black text-amber-200 hover:bg-amber-500/20">Repasar {amount}</button>)}
                  <button type="button" onClick={() => startReview(finalBank.id, finalBank.questions.length)} className="rounded-xl border border-amber-400/50 bg-amber-500/10 px-2 py-3 text-sm font-black text-amber-200 hover:bg-amber-500/20">Todas</button>
                </div>
                <button type="button" onClick={() => onResetPartial(finalBank.id)} className="mt-5 w-full rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-3 text-sm font-black text-rose-200 hover:bg-rose-500/20">↺ Reiniciar solo el examen final</button>
                <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">Avance independiente: responder o reiniciar aquí no cambia el progreso de los parciales originales.</p>
              </article>
            )}</>
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

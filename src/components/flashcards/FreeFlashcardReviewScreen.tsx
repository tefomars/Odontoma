import { useEffect, useEffectEvent, useState } from "react"
import StudyImage from "../StudyImage"
import FlashcardStudyModeSwitch from "./FlashcardStudyModeSwitch"
import { getFlashcardsBySource, type FlashcardSource } from "@/lib/flashcardDecks"
import { filterActiveFlashcards } from "@/lib/suspendedFlashcards"
import { shuffleArray } from "@/lib/shuffleQuestion"
import { advanceFreeReview, createFreeReview, selectFlashcardScope, undoFreeReview } from "@/lib/flashcardPractice"
import { loadFreeFlashcardProgress, resetFreeFlashcardProgress, saveFreeFlashcardResult, selectFreeFlashcards, type FreeFlashcardResult } from "@/lib/freeFlashcardProgress"
import type { Flashcard } from "@/content/flashcards/histologia/cards"

type Props = {
  onBack: () => void
  onMenu?: () => void
  selectedTopic?: string
  selectedSubtopic?: string
  source?: FlashcardSource
  cards?: Flashcard[]
  limit?: number
  reviewPreference?: "new" | "incorrect" | "mixed"
}
type UndoResult = { cardId: string; previous?: FreeFlashcardResult }

export default function FreeFlashcardReviewScreen({ onBack, onMenu, selectedTopic = "all", selectedSubtopic, source = "default", cards, limit, reviewPreference = "mixed" }: Props) {
  // Keep the selected bank stable for this session. Progress is independent of FSRS.
  const [scope] = useState(() => selectFlashcardScope(
    cards ?? getFlashcardsBySource(source, source === "user" ? selectedTopic : undefined),
    source, selectedTopic, selectedSubtopic
  ))
  const active = filterActiveFlashcards(scope)
  const [progress, setProgress] = useState(loadFreeFlashcardProgress)
  const [preference, setPreference] = useState(reviewPreference)
  const [session, setSession] = useState(() => createFreeReview(
    shuffleArray(selectFreeFlashcards(active, progress, preference)).slice(0, limit).map(card => card.id)
  ))
  const [undoResults, setUndoResults] = useState<UndoResult[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [storageError, setStorageError] = useState("")
  const currentCard = active.find(card => card.id === session.queue[session.cursor])
  const completed = active.filter(card => progress[card.id]?.status === "completed").length
  const remaining = selectFreeFlashcards(active, progress, preference)

  function advance(repeat: boolean) {
    if (!showAnswer || !currentCard) return
    try {
      // Save before advancing, including the last card and partial rounds.
      const previous = loadFreeFlashcardProgress()[currentCard.id]
      const next = saveFreeFlashcardResult(currentCard.id, {
        status: repeat ? "incorrect" : "completed", reviewedAt: new Date().toISOString()
      })
      setProgress(next)
      setUndoResults(history => [...history, { cardId: currentCard.id, previous }].slice(-100))
      setSession(state => advanceFreeReview(state, repeat))
      setShowAnswer(false)
      setStorageError("")
    } catch {
      setStorageError("No se pudo guardar el avance en este dispositivo. Liberá espacio o habilitá el almacenamiento y volvé a intentar; la tarjeta no avanzó.")
    }
  }

  function undo() {
    const previous = undoResults.at(-1)
    if (!previous) return
    try {
      setProgress(saveFreeFlashcardResult(previous.cardId, previous.previous))
      setUndoResults(history => history.slice(0, -1))
      setSession(state => undoFreeReview(state))
      setShowAnswer(false)
      setStorageError("")
    } catch { setStorageError("No se pudo guardar el cambio. No se deshizo la tarjeta; intentá de nuevo.") }
  }

  function startRound(ids: string[]) {
    setSession(createFreeReview(shuffleArray(ids).slice(0, limit)))
    setUndoResults([])
    setShowAnswer(false)
  }

  function reset() {
    if (!window.confirm("¿Reiniciar el repaso sin espera de este bloque? Volverán a aparecer sus tarjetas. No se cambiarán FSRS, las suspensiones ni otros bloques.")) return
    try {
      const next = resetFreeFlashcardProgress(scope.map(card => card.id))
      setProgress(next)
      setPreference("mixed")
      startRound(selectFreeFlashcards(active, next, "mixed").map(card => card.id))
      setStorageError("")
    } catch { setStorageError("No se pudo reiniciar el avance. Intentá de nuevo; tu memoria anterior se conserva.") }
  }

  const keyboardAction = useEffectEvent((event: KeyboardEvent) => {
    if (!currentCard || (event.target as HTMLElement)?.closest("input,textarea,select,button,a,[contenteditable=true]")) return
    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault()
      if (!showAnswer) setShowAnswer(true)
      else advance(false)
    } else if (showAnswer && ["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault()
      advance(event.key === "1" || event.key === "2")
    }
  })
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if (!event.repeat) keyboardAction(event) }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  function tap(event: React.PointerEvent<HTMLElement>) {
    if (!currentCard || event.pointerType !== "touch" || document.documentElement.classList.contains("is-swiping-back") || (event.target as HTMLElement).closest("button,a,input,textarea,select")) return
    if (!showAnswer) setShowAnswer(true)
    else advance(event.clientX < window.innerWidth / 2)
  }

  return (
    <main className="flashcard-review-shell relative h-[100dvh] overflow-hidden bg-[#09090b] p-5 text-white">
      <div className="flashcard-review-content mx-auto flex h-full max-w-3xl flex-col overflow-hidden">
        <header className="flashcard-review-header flex shrink-0 flex-wrap items-center justify-between gap-2 pb-2">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-black text-zinc-300">← Volver</button>
          <span className="text-xs font-black text-violet-300">Sin espera{currentCard ? ` · ${session.cursor + 1} / ${session.queue.length}` : ""}</span>
          {onMenu && <button type="button" onClick={onMenu} className="rounded-2xl border border-violet-500/30 px-3 py-2 text-xs font-black text-violet-200">Menú principal</button>}
        </header>
        <div className="shrink-0"><FlashcardStudyModeSwitch/></div>
        <section onPointerUp={tap} className="flashcard-review-card flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-400" role="status">{completed} de {active.length} completadas en este bloque · Avance guardado en este dispositivo</p>
            <button type="button" onClick={reset} className="rounded-xl border border-rose-400/30 px-3 py-2 text-xs font-bold text-rose-200">Reiniciar este bloque</button>
          </div>
          {storageError && <p role="alert" className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">{storageError}</p>}
          {currentCard ? <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {currentCard.topic && <span className="break-words rounded-full bg-violet-500/15 px-3 py-1 text-xs font-black text-violet-200">{currentCard.topic}</span>}
              {currentCard.subtopic && <span className="break-words rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">{currentCard.subtopic}</span>}
              {undoResults.length > 0 && <button type="button" onClick={undo} className="rounded-xl border border-amber-500/40 px-3 py-2 text-xs font-black text-amber-200">Deshacer ({undoResults.length})</button>}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Frente</p>
              <h1 className="w-full break-words text-3xl font-black leading-tight md:text-5xl">{currentCard.front}</h1>
              <StudyImage src={currentCard.image} alt={currentCard.imageAlt}/>
              {showAnswer && <div className="mt-6 w-full border-t border-zinc-800 pt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Respuesta</p>
                <p className="whitespace-pre-wrap break-words text-2xl font-bold leading-relaxed md:text-3xl">{currentCard.back}</p>
                <StudyImage src={currentCard.backImage} alt={currentCard.imageAlt}/>
              </div>}
            </div>
            {!showAnswer ? <button type="button" onClick={() => setShowAnswer(true)} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 font-black text-black">Mostrar respuesta</button> : <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => advance(true)} className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-4 font-black text-amber-200">1 · Otra vez</button>
              <button type="button" onClick={() => advance(false)} className="rounded-2xl bg-emerald-500 px-4 py-4 font-black text-black">3 · La recuerdo</button>
            </div>}
          </> : <div className="my-auto text-center">
            <h1 className="text-3xl font-black">{session.queue.length ? "Ronda terminada" : completed === active.length && active.length ? "Bloque completado" : "No hay tarjetas para este filtro"}</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Las completadas no volverán a salir, aunque salgás y regresés. Podés reiniciar este bloque cuando quieras; FSRS no cambia.</p>
            {remaining.length > 0 && <button type="button" onClick={() => startRound(remaining.map(card => card.id))} className="mt-6 w-full rounded-2xl bg-violet-500 px-5 py-4 font-black text-white">Continuar con pendientes ({remaining.length})</button>}
            {undoResults.length > 0 && <button type="button" onClick={undo} className="mt-3 rounded-2xl border border-amber-500/40 px-4 py-3 font-black text-amber-200">Deshacer última tarjeta</button>}
            <button type="button" onClick={onBack} className="mt-3 w-full rounded-2xl border border-zinc-700 px-5 py-3 font-black text-zinc-300">Elegir otro tema</button>
          </div>}
        </section>
      </div>
    </main>
  )
}

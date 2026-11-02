import { useFlashcardStudyMode } from "@/lib/flashcardStudyMode"
export default function FlashcardStudyModeSwitch() {
  const [mode, setMode] = useFlashcardStudyMode()
  return <div data-flashcard-mode-switch className="my-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-700/70 bg-zinc-950/60 px-3 py-2">
    <div role="group" aria-label="Modo de repaso de flashcards" className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-zinc-400">Modo</span>{([["fsrs", "FSRS"], ["free", "Sin espera"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${mode === value ? "border-violet-400/70 bg-violet-500/15 text-violet-200" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>{label}</button>)}</div>
    <p className="max-w-sm text-xs leading-relaxed text-zinc-400">{mode === "free" ? "Sin cooldown. Recuerda las completadas hasta que reinicies el bloque, sin cambiar FSRS." : "Repasos programados según tu memoria."}</p>
  </div>
}

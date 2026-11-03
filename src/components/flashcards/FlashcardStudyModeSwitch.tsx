import { useState } from "react"
import type { FlashcardStudyMode } from "@/lib/flashcardPractice"
import { useFlashcardStudyMode } from "@/lib/flashcardStudyMode"

type OptionsProps = {
  mode: FlashcardStudyMode
  onChange: (mode: FlashcardStudyMode) => void
}

const options = [
  { value: "fsrs", label: "Repetición espaciada", detail: "Según tu memoria" },
  { value: "free", label: "Solo flashcards", detail: "Repasá cuando quieras" },
] as const

export function FlashcardStudyModeOptions({ mode, onChange }: OptionsProps) {
  return (
    <section
      data-flashcard-mode-picker
      aria-label="Elegir modo de flashcards"
      className="w-full min-w-0 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 lg:w-[23rem] lg:shrink-0"
    >
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
        Elegir modo de flashcards
      </h2>
      <div role="group" aria-label="Modo de flashcards" className="flashcard-mode-options grid grid-cols-2 gap-2">
        {options.map(({ value, label, detail }) => (
          <button
            key={value}
            type="button"
            data-flashcard-mode={value}
            aria-pressed={mode === value}
            onClick={() => onChange(value)}
            className={`min-w-0 rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${mode === value
              ? "border-violet-400/70 bg-violet-500/15 text-violet-100"
              : "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"}`}
          >
            <span className="block min-h-10 text-sm font-black leading-5">{label}</span>
            <span className="mt-1 block text-[11px] leading-4 text-zinc-400">{detail}</span>
          </button>
        ))}
      </div>
      <p role="status" className="mt-3 text-xs leading-relaxed text-zinc-400">
        {mode === "fsrs"
          ? "FSRS programa cuándo volver a repasar cada tarjeta."
          : "Sin tiempos de espera. Recuerda las completadas hasta que reinicies el bloque, sin cambiar tu progreso FSRS."}
      </p>
    </section>
  )
}

function SavedStudyMode() {
  const [mode, setMode] = useFlashcardStudyMode()
  return <FlashcardStudyModeOptions mode={mode} onChange={setMode} />
}

function PreviewStudyMode() {
  // The structure editor renders in a portal: keep preview clicks out of real storage.
  const [mode, setMode] = useState<FlashcardStudyMode>("fsrs")
  return <FlashcardStudyModeOptions mode={mode} onChange={setMode} />
}

export default function FlashcardStudyModeSwitch({ preview = false }: { preview?: boolean }) {
  return preview ? <PreviewStudyMode /> : <SavedStudyMode />
}

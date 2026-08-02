import logoImage from "@/assets/logo.png"

import BackupPanel from "@/components/BackupPanel"
import {
  mainMenuContent,
  type AppMenuCard,
  type MainMenuContent
} from "@/content/appBuilder"

type Props = {
  onSelectQuizzes: () => void
  onSelectFlashcards: () => void
  content?: MainMenuContent
  editorMode?: boolean
  onEditHeader?: () => void
  onEditCard?: (card: AppMenuCard) => void
}

export default function StudyMethodScreen({
  onSelectQuizzes,
  onSelectFlashcards,
  content = mainMenuContent,
  editorMode = false,
  onEditHeader,
  onEditCard
}: Props) {
  const actions: Record<string, () => void> = {
    quizzes: onSelectQuizzes,
    flashcards: onSelectFlashcards
  }

  return (
    <main className="min-h-screen bg-[#09090b] p-5 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col justify-center gap-8">
        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="relative mb-8 flex items-center gap-4">
            <img src={logoImage} alt="Odontoma" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
                {content.eyebrow}
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                {content.title}
              </h1>
            </div>
            {editorMode && (
              <EditorButton label="Editar encabezado" onClick={onEditHeader} />
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {content.cards.map(card => (
              <div className="relative" key={card.id}>
                <button
                  type="button"
                  disabled={!editorMode && (card.destination || card.id) === "coming-soon"}
                  onClick={() => editorMode ? onEditCard?.(card) : actions[card.destination || card.id]?.()}
                  className="group relative h-full w-full overflow-hidden rounded-[1.75rem] border p-6 text-left transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: `${card.accentColor}55`,
                    backgroundColor: `${card.accentColor}18`
                  }}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div
                      className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl px-3 font-black ring-1"
                      style={{
                        color: card.accentColor,
                        backgroundColor: `${card.accentColor}22`,
                        borderColor: `${card.accentColor}55`
                      }}
                    >
                      {card.symbol}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12">
                      →
                    </div>
                  </div>
                  <p
                    className="text-xs font-black uppercase tracking-[0.2em]"
                    style={{ color: card.accentColor }}
                  >
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.subtitle}</p>
                  <p className="mt-6 text-sm font-black" style={{ color: card.accentColor }}>
                    Entrar →
                  </p>
                </button>
                {editorMode && (
                  <EditorButton label={`Editar ${card.title}`} onClick={() => onEditCard?.(card)} />
                )}
              </div>
            ))}
          </div>
        </section>

        {!editorMode && <BackupPanel />}
      </div>
    </main>
  )
}

function EditorButton({
  label,
  onClick
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 z-20 rounded-xl border border-emerald-400/30 bg-black/70 px-3 py-2 text-xs font-black text-emerald-200 shadow-xl backdrop-blur hover:bg-black/90"
    >
      ✎ {label}
    </button>
  )
}

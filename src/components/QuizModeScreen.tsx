import logoImage from "@/assets/logo.png"

import {
  quizMenuContent,
  type AppMenuCard,
  type QuizMenuContent
} from "@/content/appBuilder"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onSelectMultipleChoice: () => void
  onSelectOpenEnded: () => void
  onSelectMyQuizzes: () => void
  onSelectDestination?: (destination: string) => void
  content?: QuizMenuContent
  editorMode?: boolean
  onEditHeader?: () => void
  onEditCard?: (card: AppMenuCard) => void
  onReorderCard?: (sourceId: string, targetId: string) => void
}

export default function QuizModeScreen({
  onBack,
  onMainMenu,
  onSelectMultipleChoice,
  onSelectOpenEnded,
  onSelectMyQuizzes,
  onSelectDestination,
  content = quizMenuContent,
  editorMode = false,
  onEditHeader,
  onEditCard,
  onReorderCard
}: Props) {
  const actions: Record<string, () => void> = {
    "multiple-choice": onSelectMultipleChoice,
    "open-ended": onSelectOpenEnded,
    "my-quizzes": onSelectMyQuizzes
  }
  const mainCards = content.cards.filter(card =>
    card.section ? card.section === "main" : card.id === "multiple-choice" || card.id === "open-ended"
  )
  const toolCards = content.cards.filter(card => card.section ? card.section === "tools" : card.id === "my-quizzes")
  const activateCard = (card: AppMenuCard) => {
    if (editorMode) return onEditCard?.(card)
    const destination = card.destination || card.id
    const action = actions[destination]
    if (action) action()
    else onSelectDestination?.(destination)
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20">
            ← Atrás
          </button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-300 hover:bg-zinc-800">
            Menú principal
          </button>
        </div>

        <header className="relative mb-10">
          <p className="mb-3 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-violet-300">
            <img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />
            {content.eyebrow}
          </p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">{content.subtitle}</p>
          {editorMode && <EditorButton label="Editar encabezado" onClick={onEditHeader} />}
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {mainCards.map(card => (
            <QuizTypeCard
              key={card.id}
              card={card}
              editorMode={editorMode}
              onClick={() => activateCard(card)}
              onEdit={() => onEditCard?.(card)}
              onReorderCard={onReorderCard}
            />
          ))}
        </section>

        {toolCards.length > 0 && (
          <section className="mt-8 border-t border-zinc-800 pt-8">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              {content.toolsLabel}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {toolCards.map(card => (
                <QuizTypeCard
                  key={card.id}
                  card={card}
                  compact
                  editorMode={editorMode}
                  onClick={() => activateCard(card)}
                  onEdit={() => onEditCard?.(card)}
                  onReorderCard={onReorderCard}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function QuizTypeCard({
  card,
  compact = false,
  editorMode = false,
  onClick,
  onEdit,
  onReorderCard
}: {
  card: AppMenuCard
  compact?: boolean
  editorMode?: boolean
  onClick: () => void
  onEdit: () => void
  onReorderCard?: (sourceId: string, targetId: string) => void
}) {
  return (
    <div
      className="relative"
      draggable={editorMode}
      onDragStart={event => event.dataTransfer.setData("text/odontoma-card", card.id)}
      onDragOver={event => editorMode && event.preventDefault()}
      onDrop={event => {
        if (!editorMode) return
        event.preventDefault()
        const sourceId = event.dataTransfer.getData("text/odontoma-card")
        if (sourceId) onReorderCard?.(sourceId, card.id)
      }}
    >
      <button
        type="button"
        disabled={!editorMode && (card.destination || card.id) === "coming-soon"}
        onClick={onClick}
        className={`group h-full w-full rounded-[2rem] border p-7 text-left transition hover:scale-[1.01] ${compact ? "min-h-[170px]" : "min-h-[260px]"}`}
        style={{
          borderColor: `${card.accentColor}55`,
          backgroundColor: `${card.accentColor}18`
        }}
      >
        <div className={`${compact ? "mb-5" : "mb-10"} flex items-start justify-between gap-4`}>
          <span
            className="grid min-h-14 min-w-14 place-items-center rounded-2xl px-3 text-sm font-black ring-1"
            style={{ color: card.accentColor, backgroundColor: `${card.accentColor}22` }}
          >
            {card.symbol}
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-2xl transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12">
            →
          </span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: card.accentColor }}>
          {card.eyebrow}
        </p>
        <h2 className={`${compact ? "text-3xl" : "text-4xl"} mt-3 font-black tracking-tight`}>
          {card.title}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{card.subtitle}</p>
      </button>
      {editorMode && <EditorButton label={`Editar ${card.title}`} onClick={onEdit} />}
    </div>
  )
}

function EditorButton({ label, onClick }: { label: string; onClick?: () => void }) {
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

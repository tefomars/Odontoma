import logoImage from "@/assets/logo.png"

import type { CustomPage, CustomPageDestination } from "@/content/appBuilder/customPages"

type Props = {
  page: CustomPage
  onBack: () => void
  onMainMenu: () => void
  onNavigate: (destination: CustomPageDestination) => void
}

export default function CustomPageScreen({ page, onBack, onMainMenu, onNavigate }: Props) {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-black text-zinc-300 hover:bg-zinc-900">← Atrás</button>
          <button type="button" onClick={onMainMenu} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-300 hover:bg-zinc-800">Menú principal</button>
        </div>

        <header className="mb-8 rounded-[2rem] border border-zinc-800 bg-[#111113] p-7 sm:p-9">
          <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.25em]" style={{ color: page.accentColor }}>
            <img src={logoImage} alt="Odontoma" className="h-10 w-10 object-contain" />
            {page.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{page.title}</h1>
          {page.description && <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg">{page.description}</p>}
        </header>

        <section className="space-y-4 rounded-[2rem] border border-zinc-800 bg-[#111113] p-5 sm:p-7">
          {page.blocks.length === 0 && <p className="py-12 text-center text-zinc-500">Esta pantalla todavía no tiene bloques.</p>}
          {page.blocks.map(block => {
            if (block.type === "divider") return <hr key={block.id} className="my-7 border-zinc-800" />
            if (block.type === "heading") return <h2 key={block.id} className="pt-3 text-3xl font-black tracking-tight">{block.title}</h2>
            if (block.type === "text") return <p key={block.id} className="whitespace-pre-wrap leading-relaxed text-zinc-300">{block.text}</p>
            if (block.type === "callout") return (
              <article key={block.id} className="rounded-[1.5rem] border p-5" style={{ borderColor: `${block.accentColor || page.accentColor}55`, backgroundColor: `${block.accentColor || page.accentColor}16` }}>
                {block.symbol && <span className="text-xl">{block.symbol}</span>}
                {block.title && <h3 className="mt-2 text-xl font-black">{block.title}</h3>}
                {block.text && <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-300">{block.text}</p>}
              </article>
            )
            return (
              <button key={block.id} type="button" disabled={!block.destination} onClick={() => block.destination && onNavigate(block.destination)} className="group flex w-full items-center justify-between gap-4 rounded-[1.5rem] border p-5 text-left transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: `${block.accentColor || page.accentColor}66`, backgroundColor: `${block.accentColor || page.accentColor}18` }}>
                <span>
                  {block.symbol && <span className="mr-3 font-black" style={{ color: block.accentColor || page.accentColor }}>{block.symbol}</span>}
                  <strong className="text-lg">{block.title || "Botón"}</strong>
                  {block.text && <span className="mt-1 block text-sm text-zinc-400">{block.text}</span>}
                </span>
                <span className="text-2xl transition group-hover:translate-x-1">→</span>
              </button>
            )
          })}
        </section>
      </div>
    </main>
  )
}

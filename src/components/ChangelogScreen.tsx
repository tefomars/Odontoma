import { useState } from "react"
import { changelogData, currentAppVersion, publishedChangelog } from "@/content/changelog"

export default function ChangelogScreen({ onBack, onMainMenu }: { onBack: () => void; onMainMenu: () => void }) {
  const [limit, setLimit] = useState(15)
  const entries = publishedChangelog()
  return <main className="min-h-screen bg-[#09090b] p-5 text-white sm:p-8">
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="flex items-center justify-between gap-3">
        <button className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-black" onClick={onBack}>← Volver</button>
        <button className="rounded-2xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm font-black text-violet-200" onClick={onMainMenu}>Menú principal</button>
      </nav>
      <header data-studio-target={JSON.stringify({ panel: "changelog" })} className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-widest text-sky-300">Novedades de Odontoma</p>
        <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-5xl">{changelogData.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-zinc-400">{changelogData.description}</p>
        <p className="mt-4 text-sm font-bold text-sky-300">Versión actual · v{currentAppVersion()}</p>
      </header>
      <div className="space-y-4">{entries.slice(0, limit).map(entry => <article key={entry.id} data-studio-target={JSON.stringify({ panel: "changelog", id: entry.id })} className="min-w-0 rounded-3xl border border-zinc-800 bg-[#111113] p-6">
        <time className="text-xs font-bold text-sky-300" dateTime={entry.date}>{new Intl.DateTimeFormat("es-GT", { dateStyle: "long", timeZone: entry.date.length === 10 ? "UTC" : "America/Guatemala" }).format(new Date(entry.date))}</time>
        <h2 className="mt-2 break-words text-xl font-black">{entry.title}</h2>
        {entry.body && <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-zinc-300">{entry.body}</p>}
      </article>)}</div>
      {!entries.length && <p className="p-6 text-zinc-400">Todavía no hay cambios publicados.</p>}
      {entries.length > limit && <button className="w-full rounded-2xl border border-zinc-700 p-4 font-bold" onClick={() => setLimit(n => n + 15)}>Ver cambios anteriores</button>}
    </div>
  </main>
}

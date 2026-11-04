import { useEffect, useState } from "react"
import { changelogCommits, changelogData, currentAppVersion } from "@/content/changelog"
import { bumpAppVersion, changelogCalendarDate, resolveChangelog, validChangelog, type ChangelogData, type ChangelogEntry } from "@/content/changelog/model"
import { writeBrowserStorage } from "@/lib/storageSafety"
import { useHistoryState } from "./useHistoryState"
import { useDraftStatus } from "./draftStatus"
import { useWorkspaceHistory, workspaceNavigate, type WorkspaceTarget } from "./workspaceBridge"
import "./changelog-editor.css"

const draftKey = "odontoma-changelog-draft-v1"
export default function ChangelogEditor({ active, target }: { active: boolean; target?: WorkspaceTarget }) {
  const history = useHistoryState<ChangelogData>(changelogData, 80, "changelog")
  const [applied, setApplied] = useState(changelogData)
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [recovered, setRecovered] = useState<ChangelogData | null>(null)
  const invalid = !validChangelog(history.state)
  useDraftStatus("changelog", loaded, history.state, applied, recovered ? "Hay un borrador antiguo del changelog pendiente de revisar." : invalid ? "Revisá la versión, los títulos y las fechas antes de guardar." : undefined)
  useWorkspaceHistory(active, history)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Select the entry requested by external workspace navigation.
    if (active && target?.id) setSelected(target.id)
  }, [active, target])
  useEffect(() => {
    let alive = true
    fetch("/__odontoma-studio/changelog").then(async response => { if (!response.ok) throw new Error(await response.text()); return response.json() }).then(value => {
      if (!alive) return
      if (!validChangelog(value)) throw new Error("No se pudo validar el changelog guardado.")
      let next = value
      try {
        const raw = localStorage.getItem(draftKey)
        const draft = raw ? JSON.parse(raw) : null
        if (draft && validChangelog(draft.value)) {
          if (JSON.stringify(draft.base) === JSON.stringify(value)) next = draft.value
          else if (JSON.stringify(draft.value) !== JSON.stringify(draft.base)) setRecovered(draft.value)
        }
      } catch { setError("No se pudo leer un borrador local; el proyecto guardado no se modificó.") }
      setApplied(value); history.reset(next); setLoaded(true)
    }).catch(e => { if (alive) setError(String(e)) })
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!loaded || recovered) return
    writeBrowserStorage(draftKey, JSON.stringify({ base: applied, value: history.state }))
    const flush = (event: Event) => { (event as CustomEvent).detail.files.changelog = history.state }
    window.addEventListener("odontoma-flush-drafts", flush)
    return () => window.removeEventListener("odontoma-flush-drafts", flush)
  }, [history.state, applied, loaded, recovered])
  const entries = resolveChangelog(changelogCommits, history.state, true)
  const current = entries.find(entry => entry.id === selected)
  function update(entry: ChangelogEntry) {
    history.setState(data => ({ ...data, entries: [...data.entries.filter(e => e.id !== entry.id), entry] }))
  }
  function add() {
    const entry: ChangelogEntry = { id: `manual-${crypto.randomUUID()}`, date: changelogCalendarDate(new Date().toISOString()), title: "Nueva actualización", body: "" }
    update(entry); setSelected(entry.id)
  }
  return <section className="changelog-editor">
    <header><small>BACKUP Y OPCIONES</small><h2>Versión e historial de cambios</h2><p>Elegí la versión antes de publicar. Los mensajes de Git se agregan al iniciar o construir la app; sus correcciones se conservan al volver a construir.</p>
      <div className="studio-segmented"><button disabled={!loaded || !!recovered} onClick={add}>＋ Agregar cambio</button><button onClick={() => workspaceNavigate({ panel: "pages", id: "backup-options" })}>Editar menú Backup y Opciones</button><button onClick={() => workspaceNavigate({ panel: "preview", destination: "changelog" })}>Ver changelog en la app</button></div>
    </header>
    <section className="changelog-release" aria-label="Versión de la publicación">
      <label>Versión de Odontoma<input value={history.state.appVersion ?? currentAppVersion()} placeholder="0.10.1" maxLength={20} spellCheck={false} inputMode="decimal" onChange={e => history.setState(data => ({ ...data, appVersion: e.target.value.trim().replace(/^v/i, "") }))}/></label>
      <p>Se verá como <strong>Odontoma v{history.state.appVersion || currentAppVersion()}</strong> en las etiquetas de la app y en el historial de cambios.</p>
      <div className="studio-segmented">{([["patch", "Corrección"], ["minor", "Mejora"], ["major", "Versión mayor"]] as const).map(([step, label]) => {
        const next = bumpAppVersion(history.state.appVersion ?? currentAppVersion(), step)
        return <button key={step} disabled={!loaded || !!recovered || !next} onClick={() => { if (next) history.setState(data => ({ ...data, appVersion: next })) }}>{label}{next ? ` → ${next}` : ""}</button>
      })}</div>
      <p>También podés escribir el número directamente, con formato <code>0.10.1</code>. Elegirlo no publica nada ni cambia preguntas o progreso: guardá en Odontoma y después usá tus comandos habituales.</p>
    </section>
    {error && <p role="alert">{error}</p>}
    {recovered && <aside><p>Hay un borrador de otra versión. No se aplicó nada.</p><button onClick={() => { if (confirm("¿Reemplazar el borrador actual del changelog por el recuperado? Todavía no se guardará en el proyecto.")) { history.setState(recovered); setRecovered(null) } }}>Recuperar para revisar</button><button onClick={() => { if (confirm("¿Descartar solo este borrador antiguo del changelog?")) setRecovered(null) }}>Conservar versión guardada</button></aside>}
    <label>Título público<input value={history.state.title} onChange={e => history.setState(data => ({ ...data, title: e.target.value }))}/></label>
    <label>Descripción pública<textarea rows={2} value={history.state.description} onChange={e => history.setState(data => ({ ...data, description: e.target.value }))}/></label>
    <div className="changelog-editor-grid"><nav aria-label="Cambios publicados y ocultos">{entries.map(entry => <button key={entry.id} className={entry.id === selected ? "active" : ""} onClick={() => setSelected(entry.id)}><small>{entry.id.startsWith("git-") ? "Git" : "Manual"} · {entry.date && Number.isFinite(Date.parse(entry.date)) ? changelogCalendarDate(entry.date) : "Revisar fecha"}{entry.hidden ? " · Oculto" : ""}</small><strong>{entry.title || "Sin título"}</strong></button>)}</nav>
      <div>{current ? <>
        <label>Título del cambio<input value={current.title} maxLength={300} onChange={e => update({ ...current, title: e.target.value })}/></label>
        <label>Fecha<input type="date" value={current.date && Number.isFinite(Date.parse(current.date)) ? changelogCalendarDate(current.date) : ""} onChange={e => update({ ...current, date: e.target.value })}/></label>
        <label>Detalle del cambio<textarea rows={9} value={current.body} maxLength={12000} onChange={e => update({ ...current, body: e.target.value })}/></label>
        <div className="studio-segmented"><button onClick={() => update({ ...current, hidden: !current.hidden })}>{current.hidden ? "Volver a publicar" : "Ocultar de la app"}</button>
          {!current.id.startsWith("git-") && <button className="studio-danger" onClick={() => { if (confirm("¿Quitar esta nota manual del borrador? Podés deshacerlo antes de guardar.")) { history.setState(data => ({ ...data, entries: data.entries.filter(e => e.id !== current.id) })); setSelected(null) } }}>Eliminar nota manual</button>}
        </div><p>Ocultar un mensaje de Git no borra el commit. Queda oculto en futuras publicaciones, hasta que lo restaures aquí.</p>
      </> : <p>Elegí un cambio de la lista o agregá una nota manual.</p>}</div>
    </div>
    {invalid && <p role="alert">Completá los títulos, usá fechas válidas y una versión como 0.10.1 antes de guardar.</p>}
    <p>Usá Deshacer / Rehacer y Guardar en Odontoma arriba. Después publicá con tus comandos habituales. El texto de <code>git commit -m</code> será público: escribí ahí la novedad para tus compañeros, sin datos privados.</p>
  </section>
}

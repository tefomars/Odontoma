import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { draft, libraryDraftRecord } from "./LibraryEditor"
import { useDraftReports, useNavigationIssues, type DraftArea } from "./draftStatus"
import { workspaceNavigate, type WorkspaceTarget } from "./workspaceBridge"
import { describeChanges, localHistoryDate, type HistoryEntry, type ProjectSnapshot } from "./projectHistory"
import { libraryChanges, writtenChanges } from "./librarySafety"
import { collectProjectDraft } from "./projectDraft"
import type { StudioData } from "@/content/studio/schema"

const keys: Record<string, string> = { written: "odontoma-open-quiz-builder-draft-v1", home: "odontoma-home-builder-draft-v2", decks: "odontoma-flashcard-subjects-builder-draft-v1", pages: "odontoma-custom-pages-draft-v1", overrides: "odontoma-ui-overrides-draft-v1", theme: "odontoma-builder-draft-v1", organization: "odontoma-organization-draft-v1", changelog: "odontoma-changelog-draft-v1" }
async function json(url: string, options?: RequestInit) { const r = await fetch(url, options); if (!r.ok) throw new Error(await r.text()); return r.json() }
async function clearDrafts() {
  Object.values(keys).forEach(key => localStorage.removeItem(key))
  await new Promise<void>((resolve, reject) => { const r = indexedDB.deleteDatabase("odontoma-builder-library"); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); r.onblocked = () => reject(new Error("Cerrá otras pestañas del builder e intentá otra vez.")) })
}
export default function ProjectTools() {
  const [status, setStatus] = useState(() => sessionStorage.getItem("odontoma-builder-last-save") || "Borradores locales · nada se publica automáticamente")
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [review, setReview] = useState(false)
  const [baseProject, setBaseProject] = useState<ProjectSnapshot | null>(null)
  const [savePreview, setSavePreview] = useState<ProjectSnapshot | null>(null)
  const [previewBusy, setPreviewBusy] = useState(false)
  useEffect(() => { let active = true; Promise.all([json("/__odontoma-studio/project"), json("/__odontoma-studio/catalog")]).then(([project, library]) => { if (active) setBaseProject({ ...project, files: { ...project.files, library } }) }).catch(e => setSaveError(String(e))); return () => { active = false } }, [])
  const reports = useDraftReports()
  const issues = useNavigationIssues()
  const dirty = reports.filter(r => r.dirty)
  const ready = reports.every(r => r.ready)
  const errors = issues.filter(i => i.severity === "error")
  const blocked = reports.filter(r => r.blocked)
  const canSave = ready && Boolean(baseProject) && dirty.length > 0 && !errors.length && !blocked.length && !busy
  const prepareReview = useCallback(async () => {
    setReview(true); setSavePreview(null); setSaveError("")
    if (!ready || !baseProject) return
    setPreviewBusy(true)
    try {
      const preview = await collectProjectDraft()
      if (preview.revision !== baseProject.revision) throw new Error("El proyecto guardado cambió en otra ventana. Exportá tu borrador antes de recargar; no se guardó nada.")
      setSavePreview(preview)
    } catch (error) { setSaveError(String(error)) } finally { setPreviewBusy(false) }
  }, [ready, baseProject])
  useEffect(() => { window.dispatchEvent(new CustomEvent("odontoma-save-busy", { detail: busy })) }, [busy])
  useEffect(() => {
    if (!dirty.length || busy) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty.length, busy])
  const [versions, setVersions] = useState<HistoryEntry[]>([])
  const [pending, setPending] = useState<{ project: ProjectSnapshot; label: string } | null>(null)
  const [label, setLabel] = useState("")
  const [kind, setKind] = useState(false)
  const refresh = useCallback(async () => { setVersions(await json("/__odontoma-studio/history")) }, [])
  const applyAll = useCallback(async () => {
    if (!canSave || !savePreview) return
    setSaveError("")
    setBusy(true)
    try {
      const pendingWrites = { writes: [] as Promise<unknown>[], files: {} as Record<string, unknown> }
      window.dispatchEvent(new CustomEvent("odontoma-flush-drafts", { detail: pendingWrites }))
      await Promise.all(pendingWrites.writes)
      const project = await json("/__odontoma-studio/project")
      if (project.revision !== baseProject?.revision) throw new Error("El proyecto cambió en otra ventana. No se guardó nada. Exportá tu borrador y recargá para comparar.")
      for (const [area, key] of Object.entries(keys)) { const raw = localStorage.getItem(key); if (raw) project.files[area] = JSON.parse(raw) }
      Object.assign(project.files, pendingWrites.files)
      const library = await draft(); if (library) project.files.library = library
      if (JSON.stringify(project.files) !== JSON.stringify(savePreview.files)) throw new Error("El borrador cambió después del resumen. Volvé a abrir Revisar cambios antes de confirmar.")
      await json("/__odontoma-studio/project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...project, expectedRevision: baseProject?.revision, libraryBaseRevision: (await libraryDraftRecord())?.baseRevision }) })
      await clearDrafts()
      sessionStorage.setItem("odontoma-builder-last-save", "Guardado en Odontoma local. Se creó una copia anterior. Publicá con tu comando habitual cuando quieras.")
      window.location.reload()
    } catch (e) { setStatus(String(e)); setSaveError(String(e)); setBusy(false) }
  }, [canSave, savePreview, baseProject])
  useEffect(() => {
    const show = () => { setOpen(true); void refresh().catch(e => setStatus(String(e))) }
    const reviewSave = () => { if (!busy) void prepareReview() }
    const save = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!busy) void prepareReview() } }
    window.addEventListener("odontoma-open-history", show); window.addEventListener("keydown", save)
    window.addEventListener("odontoma-request-save-review", reviewSave)
    return () => { window.removeEventListener("odontoma-open-history", show); window.removeEventListener("keydown", save); window.removeEventListener("odontoma-request-save-review", reviewSave) }
  }, [prepareReview, busy, refresh])
  useEffect(() => {
    if (!open && !review) return
    const previous = document.activeElement as HTMLElement | null
    const bodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const modal = document.querySelector<HTMLElement>(".studio-history-modal")
    modal?.querySelector<HTMLElement>("button")?.focus()
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) { setOpen(false); setReview(false); setPending(null) }
      if (e.key !== "Tab" || !modal) return
      const items = [...modal.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],input,summary")].filter(el => el.offsetParent !== null)
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
    window.addEventListener("keydown", keyboard)
    return () => { window.removeEventListener("keydown", keyboard); document.body.style.overflow = bodyOverflow; previous?.focus() }
  }, [open, review, busy])
  async function restore() {
    if (!pending) return
    setBusy(true)
    try {
      const current = await json("/__odontoma-studio/project")
      await json("/__odontoma-studio/project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pending.project, restore: true, expectedRevision: current.revision }) })
      await clearDrafts()
      sessionStorage.setItem("odontoma-builder-last-save", "Versión restaurada LOCALMENTE. Se guardó una copia del estado anterior. Vercel no cambió: publicá nuevamente para actualizar el sitio.")
      window.location.reload()
    } catch (e) { setStatus(String(e)); setBusy(false) }
  }
  async function checkpoint() {
    setBusy(true)
    try { await json("/__odontoma-studio/checkpoint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: label.trim() || "Punto de recuperación", publication: kind }) }); setLabel(""); setStatus("Punto creado del proyecto guardado. Los borradores sin aplicar no se incluyen."); await refresh() } catch (e) { setStatus(String(e)) } finally { setBusy(false) }
  }
  const changeCounts = baseProject && savePreview ? { ...libraryChanges(baseProject.files.library as StudioData, savePreview.files.library as StudioData), written: writtenChanges(baseProject.files.written, savePreview.files.written) } : null
  return <div className="studio-project-tools">
    <button className={`studio-save-status ${dirty.length ? "has-changes" : ""}`} onClick={() => void prepareReview()} aria-label="Revisar cambios y enlaces">{!ready ? `Cargando editores (${reports.filter(r => r.ready).length}/8)…` : blocked.length ? "Borrador recuperado: requiere revisión" : errors.length ? `${errors.length} enlaces por corregir` : dirty.length ? `${dirty.length} ${dirty.length === 1 ? "sección con cambios pendientes" : "secciones con cambios pendientes"}` : "Todo guardado · local"}</button>
    <button onClick={() => { setOpen(true); void refresh().catch(e => setStatus(String(e))) }}>↶ Historial y backups</button>
    <button className="studio-primary" disabled={!canSave} onClick={() => void prepareReview()}>{busy ? "Procesando…" : "Guardar en Odontoma"} <kbd>⌘S</kbd></button>
    {saveError && <button className="studio-save-error" role="alert" title={saveError} onClick={() => setReview(true)}>No se guardó. Ver el error y revisar cambios.</button>}
    {review && createPortal(<div className="studio-modal-backdrop studio-shell" onClick={() => setReview(false)}><section className="studio-history-modal" role="dialog" aria-modal="true" aria-label="Cambios pendientes y enlaces" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setReview(false) }}><header><h2>Cambios y enlaces</h2><button autoFocus aria-label="Cerrar revisión" onClick={() => setReview(false)}>×</button></header><p>Guardar aplica todas las secciones modificadas en esta computadora. No publica en Git ni Vercel.</p>{previewBusy && <p role="status">Preparando resumen…</p>}{changeCounts && <section aria-label="Resumen antes de guardar"><h3>Esto es lo que vas a guardar</h3>{Object.entries(changeCounts).map(([type, counts]) => <p key={type}><strong>{type === "questions" ? "Opción múltiple" : type === "written" ? "Preguntas escritas" : "Flashcards"}:</strong> {counts.added} agregadas · {counts.modified} modificadas · {counts.removed} eliminadas</p>)}{baseProject && savePreview && <ul>{describeChanges(baseProject, savePreview).map(change => <li key={change}>{change}</li>)}</ul>}</section>}{blocked.map(report => <p role="alert" key={report.area}>{report.blocked}</p>)}{saveError && <p role="alert">{saveError}</p>}{reports.filter(r => r.dirty || !r.ready).map(r => <article key={r.area}><strong>{r.label}</strong><p>{r.ready ? "Cambios pendientes" : "Todavía no se pudo cargar. Recargá el builder antes de guardar."}</p><button onClick={() => { const targets: Record<DraftArea, WorkspaceTarget> = { library: { panel: "library" }, home: { panel: "structure", view: "main-menu" }, decks: { panel: "structure", view: "flashcard-subjects" }, written: { panel: "written" }, pages: { panel: "pages" }, organization: { panel: "sections" }, theme: { panel: "appearance" }, overrides: { panel: "preview" }, changelog: { panel: "changelog" } }; workspaceNavigate(targets[r.area]); setReview(false) }}>Ir al editor</button></article>)}{ready && !dirty.length && <p>No hay cambios pendientes.</p>}<h3>Revisión de navegación</h3>{!issues.length && <p>Sin enlaces rotos detectados.</p>}{issues.map(i => <article key={i.id}><strong>{i.severity === "error" ? "Corregir antes de guardar" : "Aviso"}</strong><p>{i.message}</p><button onClick={() => { workspaceNavigate(i.target); setReview(false) }}>Ir a este botón</button></article>)}<p role="status">{status}</p><button className="studio-primary" disabled={!canSave || !savePreview || Boolean(saveError) || previewBusy} onClick={() => void applyAll()}>Confirmar guardado local</button></section></div>, document.body)}
    {open && createPortal(<div className="studio-modal-backdrop studio-shell" role="presentation"><section className="studio-history-modal" role="dialog" aria-modal="true" aria-label="Historial y backups">
      <header><div><small>RECUPERACIÓN LOCAL</small><h2>Historial y backups</h2></div><button aria-label="Cerrar historial" onClick={() => { setOpen(false); setPending(null) }}>×</button></header>
      <p>De más reciente a más antigua · hora de Guatemala. Las copias automáticas conservan el estado <strong>anterior</strong> al cambio. Restaurar no publica ni revierte código.</p>
      <div className="studio-backup-links"><a href="/__odontoma-studio/backup">↓ App y builder completos (.tar.gz)</a><a href="/__odontoma-studio/project">↓ Todo lo editable (.json)</a><label>↑ Importar backup editable<input type="file" accept=".json" onChange={e => { const f = e.target.files?.[0]; if (f) void f.text().then(text => { const p = JSON.parse(text); if (p.app !== "Odontoma Project" || p.version !== 1) throw new Error("Elegí un proyecto editable Odontoma."); setPending({ project: p, label: f.name }) }).catch(e => setStatus(String(e))) }}/></label></div>
      <div className="studio-checkpoint"><h3>Guardar un punto con nombre</h3><p>Incluye el contenido ya aplicado, menús y apariencia. Para una copia del código, descargá también el .tar.gz.</p><input aria-label="Nombre del punto de recuperación" placeholder="Antes de probar Farmacología" value={label} onChange={e => setLabel(e.target.value)}/><label><input type="checkbox" checked={kind} onChange={e => setKind(e.target.checked)}/> Referencia de una publicación que hice por terminal (no se verifica Vercel)</label><button disabled={busy} onClick={() => void checkpoint()}>＋ Crear punto del proyecto guardado</button></div>
      <p role="status">{status}</p>
      {pending && <div className="studio-restore-confirm" role="alert"><h3>¿Volver a «{pending.label}»?</h3><p>Reemplaza contenido, menús, imágenes y apariencia locales, y descarta los borradores del builder. Antes se conserva el proyecto guardado actual. No toca el progreso de los estudiantes ni Vercel.</p><button disabled={busy} className="studio-danger" onClick={() => void restore()}>Confirmar restauración local</button><button onClick={() => setPending(null)}>Cancelar</button></div>}
      <div className="studio-history-list">{versions.map((v, i) => <article key={v.name}><small>{i === 0 ? "MÁS RECIENTE · " : ""}{localHistoryDate(v.createdAt)}</small><h3>{v.label}</h3><p>{v.kind === "publication" ? "Referencia manual de publicación" : v.kind === "checkpoint" ? "Punto creado por vos" : "Copia automática anterior al cambio"}</p><p>{v.counts.banks} bancos · {v.counts.questions} preguntas · {v.counts.flashcards} flashcards · {v.counts.written} escritas · {v.counts.pages} menús</p><details><summary>Diferencias respecto al proyecto actual</summary><ul>{v.changes.map(c => <li key={c}>{c}</li>)}</ul><code>{v.name}</code></details><button disabled={busy} onClick={() => void json(`/__odontoma-studio/project-revisions/${v.name}`).then(project => setPending({ project, label: v.label + " · " + localHistoryDate(v.createdAt) })).catch(e => setStatus(String(e)))}>Elegir para restaurar</button></article>)}</div>
      {!versions.length && <p>Todavía no hay copias. Creá un punto con nombre o guardá un cambio.</p>}
    </section></div>, document.body)}
  </div>
}

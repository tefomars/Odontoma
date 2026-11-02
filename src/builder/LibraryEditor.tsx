import { useEffect, useState } from "react"
import { useHistoryState } from "./useHistoryState"
import { validateStudio, type StudioData, type StudyBank, type StudyQuestion } from "@/content/studio/schema"
import type { Flashcard } from "@/content/flashcards/histologia/cards"
import ImportPanel from "./ImportPanel"
import { addLibraryContent, type CreationEvent } from "./contentCreation"
import StudyImage from "@/components/StudyImage"
import "./library.css"
import { useDraftStatus } from "./draftStatus"
import { publishIndex, useWorkspaceHistory, workspaceNavigate, type WorkspaceTarget } from "./workspaceBridge"
import { archiveLibraryBank, restoreLibraryBank } from "./libraryActions"

const uid = () => crypto.randomUUID()
const empty: StudioData = { version: 1, banks: [] }
export async function draft(value?: StudioData): Promise<StudioData | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open("odontoma-builder-library", 1); r.onupgradeneeded = () => r.result.createObjectStore("draft"); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
  try { return await new Promise((resolve, reject) => { const tx = db.transaction("draft", value ? "readwrite" : "readonly"); const r = value ? tx.objectStore("draft").put(value, "current") : tx.objectStore("draft").get("current"); tx.oncomplete = () => resolve(value || r.result); tx.onerror = () => reject(tx.error) }) } finally { db.close() }
}
function download(value: unknown, name: string) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
export function ImageField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  const [error, setError] = useState("")
  async function load(file?: File) {
    if (!file) return
    try {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 15_000_000) throw new Error("Usá JPG, PNG, WebP o GIF de hasta 15 MB.")
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close()
      onChange(canvas.toDataURL("image/webp", .85)); setError("")
    } catch (e) { setError(String(e)) }
  }
  return <fieldset><legend>{label}</legend><input aria-label={label} placeholder="URL de imagen o elegí un archivo" value={value?.startsWith("data:") ? "Imagen guardada en el proyecto" : value || ""} onChange={e => onChange(e.target.value)} /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => void load(e.target.files?.[0])} />{error && <p role="alert">{error}</p>}<StudyImage src={value} />{value && <button onClick={() => onChange("")}>Quitar imagen</button>}</fieldset>
}

export default function LibraryEditor({ active = true, target }: { active?: boolean; target?: WorkspaceTarget }) {
  const history = useHistoryState<StudioData>(empty, 30, "library")
  useWorkspaceHistory(active, history)
  const [loaded, setLoaded] = useState(false)
  const [applied, setApplied] = useState<StudioData>(empty)
  useDraftStatus("library", loaded, history.state, applied)
  const [status, setStatus] = useState("Cargando biblioteca…")
  const [bankId, setBankId] = useState("")
  const [selectedChapterId, setChapterId] = useState("")
  const [mode, setMode] = useState<"questions" | "flashcards">("questions")
  const [selectedId, setSelectedId] = useState("")
  const [search, setSearch] = useState("")
  const [importText, setImportText] = useState("")
  const [importTarget, setImportTarget] = useState("")
  const [revisions, setRevisions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const bank = history.state.banks.find(b => b.id === bankId)
  const chapterId = bank?.chapters.some(c => c.id === selectedChapterId) ? selectedChapterId : bank?.chapters[0]?.id || ""
  const chapter = bank?.chapters.find(c => c.id === chapterId)
  const items = bank ? bank[mode] : []
  const selected = items.find(q => q.id === selectedId)
  const question = mode === "questions" ? selected as StudyQuestion | undefined : undefined
  const card = mode === "flashcards" ? selected as Flashcard | undefined : undefined
  const issues = loaded ? validateStudio(history.state) : []
  const libraryState = history.state, setLibraryState = history.setState
  useEffect(() => {
    const create = (e: Event) => {
      const detail = (e as CustomEvent<CreationEvent>).detail, r = detail.request
      if (!loaded || r.type === "written") return
      try {
        const next = addLibraryContent(libraryState, r, () => `studio-${uid()}`)
        setStatus("Contenido agregado al borrador. Guardá cuando termines."); setLibraryState(next); setBankId(r.bankId); setChapterId(r.chapterId); setMode(r.type === "flashcards" ? "flashcards" : "questions"); setSelectedId("")
        detail.accepted = true; detail.target = { panel: "library", bankId: r.bankId, chapterId: r.chapterId, mode: r.type === "flashcards" ? "flashcards" : "questions" }
      } catch (error) { detail.error = String(error) }
    }
    const existing = (e: Event) => {
      const d = (e as CustomEvent).detail; if (d.type === "written") return
      const bank = libraryState.banks.find(b => b.id === d.bankId)
      d.texts = bank ? (d.type === "flashcards" ? bank.flashcards.filter(q => q.chapter === d.chapterId).map(q => q.front) : bank.questions.filter(q => q.chapter === d.chapterId).map(q => q.question)) : []
    }
    window.addEventListener("odontoma-create-content", create); window.addEventListener("odontoma-import-existing", existing)
    return () => { window.removeEventListener("odontoma-create-content", create); window.removeEventListener("odontoma-import-existing", existing) }
  }, [loaded, libraryState, setLibraryState])
  useEffect(() => { let active = true; Promise.all([fetch("/__odontoma-studio/catalog").then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json() }), draft().catch(() => undefined)]).then(([data, saved]) => { if (!active) return; setApplied(data); history.reset(saved || data); setBankId((saved || data).banks.find((b: StudyBank) => !b.archived)?.id || ""); setLoaded(true); setStatus(saved ? "Borrador recuperado. Aplicá para guardarlo en el proyecto." : "Biblioteca oficial lista para editar.") }).catch(e => setStatus(String(e))); return () => { active = false } }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!loaded) return; const timer = setTimeout(() => { void draft(history.state).catch(() => setStatus("No se pudo guardar el borrador. Exportá la biblioteca o aplicá los cambios.")) }, 600); return () => clearTimeout(timer) }, [history.state, loaded])
  useEffect(() => { const flush = (event: Event) => { (event as CustomEvent<{ writes: Promise<unknown>[] }>).detail.writes.push(draft(history.state)) }; if (loaded) window.addEventListener("odontoma-flush-drafts", flush); return () => window.removeEventListener("odontoma-flush-drafts", flush) }, [history.state, loaded])
  /* eslint-disable react-hooks/set-state-in-effect -- Synchronize external workspace navigation, preserving the editor history. */
  useEffect(() => {
    if (!loaded || !target) return
    if (target.bankId) setBankId(target.bankId)
    if (target.chapterId) setChapterId(target.chapterId)
    if (target.mode) setMode(target.mode)
    setSelectedId(""); 
    if (target.id === "__new-course" || target.id === "__new-prepartial") addBank(target.id === "__new-prepartial" ? "prepartial" : "course", target.name, target.subject)
  }, [target, loaded]) // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (loaded) publishIndex("banks", history.state.banks.map(b => ({ id: b.id, title: b.title, subject: b.subject, kind: b.kind, archived: b.archived, enabled: b.enabled, questions: b.questions.length, flashcards: b.flashcards.length, chapters: b.chapters.map(c => ({ id: c.id, title: c.title })) }))) }, [history.state, loaded])
  function updateBank(changes: Partial<StudyBank>) { if (bank) history.setState(current => ({ ...current, banks: current.banks.map(b => b.id === bank.id ? { ...b, ...changes } : b) })) }
  function updateItem(changes: object) { if (bank && selected) updateBank({ [mode]: items.map(q => q.id === selected.id ? { ...q, ...changes } : q) }) }
  function addBank(kind: StudyBank["kind"] = "course", title = "Nueva materia", subject?: string) { const id = uid(); const newBank: StudyBank = { id, title, subject: subject || title, kind, chapters: [], questions: [], flashcards: [] }; history.setState(c => ({ ...c, banks: [...c.banks, newBank] })); setBankId(id); setChapterId(""); workspaceNavigate({ panel: "library", bankId: id, mode }) }
  function archiveBank() {
    if (!bank || !confirm(`¿Quitar «${bank.title}» de la biblioteca y de los menús de Odontoma? Se conserva en Materias quitadas para recuperarla. Podés deshacer antes de aplicar.`)) return
    history.setState(current => archiveLibraryBank(current, bank.id))
    setBankId(history.state.banks.find(b => b.id !== bank.id && !b.archived)?.id || "")
    setSelectedId(""); 
    setStatus("Materia quitada del borrador. Aplicá para guardar. Podés deshacer o recuperarla en Materias quitadas.")
  }
  function addChapter() { if (!bank) return; const id = `chapter-${uid()}`; updateBank({ chapters: [...bank.chapters, { id, title: "Nuevo capítulo", subtitle: "", description: "", image: "", accent: "from-violet-500/20 to-sky-500/20", questionCount: 0 }] }); setChapterId(id); setSelectedId("") }
  function addItem() {
    if (!bank || !chapterId) return
    const id = `studio-${uid()}`
    const item = mode === "questions" ? { id, chapter: chapterId, topic: chapter?.title || "", difficulty: "easy", type: "single", question: "Nueva pregunta", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correctAnswers: [0], explanation: "", tags: [] } : { id, subject: bank.subject, book: bank.title, chapter: chapterId, topic: chapter?.title || "", subtopic: "General", front: "Nueva pregunta", back: "Respuesta", tags: [] }
    updateBank({ [mode]: [...items, item] }); setSelectedId(id)
  }
  function move(id: string, target: string) { if (!bank || id === target) return; const list = [...items]; const from = list.findIndex(q => q.id === id); const to = list.findIndex(q => q.id === target); if (from < 0 || to < 0) return; const [item] = list.splice(from, 1); list.splice(to, 0, item); updateBank({ [mode]: list }) }
  async function save() {
    if (issues.length) { setStatus(issues.slice(0, 5).join("\n")); return }
    setSaving(true)
    try { const r = await fetch("/__odontoma-studio/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(history.state) }); if (!r.ok) throw new Error(await r.text()); setApplied(history.state); setStatus("Biblioteca aplicada al proyecto. Ya podés probar Odontoma y publicar con tu comando habitual.") } catch (e) { setStatus(String(e)) } finally { setSaving(false) }
  }
  function prepareImport(text: string) {
    try {
      if (text.trim().startsWith("{")) {
        const value = JSON.parse(text)
        if (value.version === 1 && Array.isArray(value.banks)) {
          const errors = validateStudio(value); if (errors.length) throw new Error(errors.slice(0, 5).join("\n"))
          if (!confirm("Este archivo reemplaza el borrador de TODA la biblioteca. No es una importación de capítulo. ¿Continuar?")) return
          history.setState(value); setBankId(value.banks.find((b: StudyBank) => !b.archived)?.id || ""); setStatus("Biblioteca importada como borrador; revisá y guardá."); return
        }
      }
      if (!bank || !chapterId) throw new Error("Elegí una materia y capítulo primero.")
      setImportTarget(bankId + chapterId + mode); setImportText(text); setStatus("Revisá las filas y columnas en el importador de este capítulo, abajo.")
    } catch (e) { setStatus(String(e)) }
  }
  const visible = items.filter(q => (!chapterId || q.chapter === chapterId) && JSON.stringify(q).toLowerCase().includes(search.toLowerCase()))
  return <section className="library-editor">
    <aside className="library-tree"><h2>Biblioteca oficial</h2><p>Materias, capítulos y bancos de la app.</p><button onClick={() => addBank()} disabled={!loaded}>＋ Crear materia / repaso</button>{history.state.banks.filter(b => !b.archived).map(b => <button className={b.id === bankId ? "active" : ""} key={b.id} onClick={() => { setBankId(b.id); setSelectedId("");  }}><strong>{b.title}</strong><small>{b.questions.length} preguntas · {b.flashcards.length} tarjetas</small></button>)}<details><summary>Materias quitadas ({history.state.banks.filter(b => b.archived).length})</summary>{history.state.banks.filter(b => b.archived).map(b => <button key={b.id} onClick={() => { history.setState(current => restoreLibraryBank(current, b.id)); setBankId(b.id); setSelectedId(""); setStatus("Materia recuperada como borrador. Aplicá para guardar.") }}>Recuperar {b.title}</button>)}</details><hr/><a className="builder-button" href="/__odontoma-studio/backup">Descargar backup completo</a><button onClick={() => download(history.state, "odontoma-biblioteca.json")}>Exportar biblioteca con imágenes</button>{bank && <button onClick={() => download({ version: 1, [mode]: items.filter(q => !chapterId || q.chapter === chapterId) }, `${bank.title}-${mode}.json`)}>Exportar banco seleccionado</button>}<label>Importar biblioteca o banco<input type="file" accept=".json,.odontoma-quiz,.txt,.csv,.tsv" onChange={e => { const file = e.target.files?.[0]; if (file) void file.text().then(prepareImport).catch(e => setStatus(String(e))) }} /></label><button onClick={() => void fetch("/__odontoma-studio/revisions").then(r => r.json()).then(setRevisions)}>Versiones anteriores</button>{revisions.slice(0, 20).map(name => <button key={name} onClick={() => void fetch(`/__odontoma-studio/revisions/${name}`).then(r => r.json()).then((value: StudioData) => { history.setState(value); setStatus("Versión recuperada como borrador. Aplicá para restaurar.") })}>{name.replace(".json", "")}</button>)}</aside>
    <div className="library-main"><div className="studio-library-picker"><label>Materia / banco<select value={bankId} onChange={e => { setBankId(e.target.value); setSelectedId("");  }}><option value="">Elegí un banco</option>{history.state.banks.filter(b => !b.archived).map(b => <option key={b.id} value={b.id}>{b.title} · {b.subject}</option>)}</select></label><button onClick={() => addBank()}>＋ Materia</button><button onClick={() => addBank("prepartial")}>＋ Repaso</button><button onClick={() => download(history.state, "odontoma-biblioteca.json")}>Exportar todo</button>{bank && <button onClick={() => download({ version: 1, [mode]: items.filter(q => !chapterId || q.chapter === chapterId) }, `${bank.title}-${chapter?.title || "banco"}-${mode}.json`)}>Exportar este capítulo</button>}<label>Importar archivo<input type="file" accept=".json,.odontoma-quiz,.csv,.tsv,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) void f.text().then(prepareImport).catch(e => setStatus(String(e))) }}/></label><details><summary>Materias quitadas ({history.state.banks.filter(b => b.archived).length})</summary>{history.state.banks.filter(b => b.archived).map(b => <button key={b.id} onClick={() => { history.setState(c => restoreLibraryBank(c, b.id)); setBankId(b.id) }}>Recuperar {b.title}</button>)}</details></div><div className="library-toolbar library-save-toolbar"><button onClick={() => void fetch("/__odontoma-studio/catalog").then(r => r.json()).then(data => { setApplied(data); history.reset(data); setBankId(data.banks.find((b: StudyBank) => !b.archived)?.id || ""); setSelectedId(""); setStatus("Borrador restablecido a la versión guardada en el proyecto.") }).catch(e => setStatus(String(e)))}>Recargar versión del proyecto</button><button onClick={history.undo} disabled={!history.canUndo}>↶ Deshacer</button><button onClick={history.redo} disabled={!history.canRedo}>↷ Rehacer</button><button className="builder-button apply" disabled={saving || !loaded} onClick={() => void save()}>{saving ? "Guardando…" : "Aplicar biblioteca a Odontoma"}</button></div><p className="library-status" role="status">{status}</p>{bank && <>
      <details><summary>Editar materia y capítulos</summary><label>Clase para agrupar tarjetas y repasos<input value={bank.subject} onChange={e => updateBank({ subject: e.target.value, flashcards: bank.flashcards.map(c => ({ ...c, subject: e.target.value })) })}/></label><label><input type="checkbox" checked={bank.enabled !== false} onChange={e => updateBank({ enabled: e.target.checked })}/> Mostrar esta materia en Odontoma</label><label>Nombre del banco<input value={bank.title} onChange={e => updateBank({ title: e.target.value })}/></label><p>El banco guarda el contenido. Sus tarjetas de acceso pueden tener títulos distintos; renombrarlo no cambia tus preguntas.</p>{bank.kind === "course" && <button disabled={!bank.title.trim()} onClick={() => window.dispatchEvent(new CustomEvent("odontoma-sync-bank-title", { detail: { bankId: bank.id, title: bank.title.trim() } }))}>Actualizar también títulos de tarjetas de acceso</button>}<label>Tipo<select value={bank.kind} onChange={e => updateBank({ kind: e.target.value as StudyBank["kind"] })}><option value="course">Materia normal</option><option value="prepartial">Repaso pre-parcial</option></select></label><p className="studio-internal-id">Identificador interno (no se muestra al estudiante): {bank.id}</p><button onClick={archiveBank}>Quitar materia de la biblioteca</button><button onClick={addChapter}>＋ Capítulo / parcial</button>{bank.chapters.map((c, index) => <div key={c.id} className="library-chapter"><button onClick={() => { setChapterId(c.id); setSelectedId("") }}>{c.title}</button><input aria-label="Título de capítulo" value={c.title} onChange={e => updateBank({ chapters: bank.chapters.map(item => item.id === c.id ? { ...item, title: e.target.value } : item) })}/><input aria-label="Etiqueta del capítulo" placeholder="Etiqueta pequeña, por ejemplo Parcial 2" value={c.eyebrow || ""} onChange={e => updateBank({ chapters: bank.chapters.map(item => item.id === c.id ? { ...item, eyebrow: e.target.value } : item) })}/><input aria-label="Parcial o subtítulo" placeholder="Parcial 1 / subtítulo" value={c.subtitle} onChange={e => updateBank({ chapters: bank.chapters.map(item => item.id === c.id ? { ...item, subtitle: e.target.value } : item) })}/><button disabled={!index} onClick={() => { const chapters = [...bank.chapters]; [chapters[index-1], chapters[index]] = [chapters[index], chapters[index-1]]; updateBank({ chapters }) }}>↑</button><button onClick={() => { if (confirm(`¿Quitar ${c.title} y su contenido? Podés deshacerlo.`)) updateBank({ chapters: bank.chapters.filter(x => x.id !== c.id), questions: bank.questions.filter(q => q.chapter !== c.id), flashcards: bank.flashcards.filter(q => q.chapter !== c.id) }) }}>Quitar</button></div>)}{chapter && <ImageField label="Imagen del capítulo" value={chapter.image} onChange={image => updateBank({ chapters: bank.chapters.map(c => c.id === chapter.id ? { ...c, image } : c) })}/>}</details>
      <div className="library-toolbar"><select aria-label="Capítulo" value={chapterId} onChange={e => { setChapterId(e.target.value); setSelectedId("");  }}><option value="">Elegí capítulo</option>{bank.chapters.map(c => <option value={c.id} key={c.id}>{c.title} {c.subtitle}</option>)}</select><button className={mode === "questions" ? "active" : ""} onClick={() => { setMode("questions"); setSelectedId("");  }}>Opción múltiple ({bank.questions.length})</button><button className={mode === "flashcards" ? "active" : ""} onClick={() => { setMode("flashcards"); setSelectedId("");  }}>Flashcards ({bank.flashcards.length})</button><button onClick={addItem} disabled={!chapterId}>＋ Agregar</button></div>
      <ImportPanel key={bank.id + chapterId + mode} kind={mode === "questions" ? "multiple-choice" : "flashcards"} destination={bank.title + " / " + (chapter?.title || chapterId)} incomingText={importTarget === bankId + chapterId + mode ? importText : undefined} existing={items.filter(q => q.chapter === chapterId).map(q => "question" in q ? q.question : q.front)} onConfirm={rows => {
        const added = rows.map(q => mode === "questions" ? { ...q, id: `studio-${uid()}`, chapter: chapterId, question: q.question!, type: q.correctAnswers!.length > 1 ? "multiple" : "single", options: q.options!, correctAnswers: q.correctAnswers!, difficulty: q.difficulty || "medium", explanation: q.explanation || "", topic: q.topic || chapter?.title || "" } : { ...q, id: `studio-${uid()}`, chapter: chapterId, subject: bank.subject, book: bank.title, front: q.front!, back: q.back!, topic: q.topic || chapter?.title || "", subtopic: q.subtopic || "General", tags: q.tags || [] })
        const updated = { ...bank, [mode]: [...items, ...added] }
        const errors = validateStudio({ version: 1, banks: [updated] }); if (errors.length) { setStatus(errors.join("\n")); return false }
        updateBank({ [mode]: [...items, ...added] }); setImportText(""); setStatus("Contenido agregado al borrador. Guardá cuando termines.")
      }}/>
      <input aria-label="Buscar contenido" placeholder="Buscar pregunta, respuesta o subtema…" value={search} onChange={e => setSearch(e.target.value)}/><p>{visible.length} elementos en este capítulo. Arrastrá o usá las flechas para ordenar.</p>
      <div className="library-content"><div className="library-list">{visible.slice(0, 200).map((q, index) => <div key={q.id} draggable onDragStart={e => e.dataTransfer.setData("text/plain", q.id)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); move(e.dataTransfer.getData("text/plain"), q.id) }}><button className={q.id === selectedId ? "active" : ""} onClick={() => setSelectedId(q.id)}>{"question" in q ? q.question : q.front}</button><button aria-label="Mover arriba" disabled={!index} onClick={() => move(q.id, visible[index-1].id)}>↑</button><button aria-label="Mover abajo" disabled={index === visible.length-1} onClick={() => move(q.id, visible[index+1].id)}>↓</button></div>)}{visible.length > 200 && <p>Usá la búsqueda para encontrar otros elementos.</p>}</div>
      <div className="library-inspector">{selected ? <><small>ID: {selected.id}</small><label>Capítulo<select value={selected.chapter} onChange={e => updateItem({ chapter: e.target.value })}>{bank.chapters.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}</select></label><label>Tema<input value={selected.topic || ""} onChange={e => updateItem({ topic: e.target.value })}/></label>{question && <><label>Pregunta<textarea rows={4} value={question.question} onChange={e => updateItem({ question: e.target.value })}/></label><label>Dificultad<select value={question.difficulty} onChange={e => updateItem({ difficulty: e.target.value })}><option value="easy">Fácil</option><option value="medium">Media</option><option value="hard">Difícil</option></select></label><label>Tipo<select value={question.type} onChange={e => updateItem({ type: e.target.value, correctAnswers: [question.correctAnswers[0] ?? 0] })}><option value="single">Una respuesta correcta</option><option value="multiple">Varias respuestas correctas</option></select></label><div className="studio-context-links"><button onClick={() => updateItem({ options: ["Verdadero", "Falso"], type: "single", correctAnswers: [0] })}>Usar Verdadero / Falso</button><button disabled={question.options.length >= 8} onClick={() => updateItem({ options: [...question.options, `Opción ${String.fromCharCode(65 + question.options.length)}`] })}>＋ Alternativa</button></div>{question.options.map((o, i) => <label key={i} className="library-option"><input type="checkbox" aria-label={`Correcta ${String.fromCharCode(65+i)}`} checked={question.correctAnswers.includes(i)} onChange={() => updateItem({ correctAnswers: question.type === "single" ? [i] : question.correctAnswers.includes(i) ? question.correctAnswers.filter(n => n !== i) : [...question.correctAnswers, i] })}/>{String.fromCharCode(65+i)}<input value={o} onChange={e => updateItem({ options: question.options.map((v, j) => i === j ? e.target.value : v) })}/><button aria-label={`Quitar alternativa ${String.fromCharCode(65+i)}`} disabled={question.options.length <= 2} onClick={() => updateItem({ options: question.options.filter((_, j) => j !== i), correctAnswers: question.correctAnswers.filter(n => n !== i).map(n => n > i ? n - 1 : n) })}>×</button></label>)}<label>Explicación<textarea rows={4} value={question.explanation} onChange={e => updateItem({ explanation: e.target.value })}/></label></>}{card && <><label>Subtema<input value={card.subtopic} onChange={e => updateItem({ subtopic: e.target.value })}/></label><label>Frente<textarea rows={4} value={card.front} onChange={e => updateItem({ front: e.target.value })}/></label><label>Respuesta<textarea rows={5} value={card.back} onChange={e => updateItem({ back: e.target.value })}/></label></>}<ImageField label={card ? "Imagen del frente" : "Imagen de la pregunta"} value={selected.image} onChange={image => updateItem({ image })}/>{card && <ImageField label="Imagen de la respuesta" value={card.backImage} onChange={backImage => updateItem({ backImage })}/>}<label>Descripción de imagen<input value={selected.imageAlt || ""} onChange={e => updateItem({ imageAlt: e.target.value })}/></label><button onClick={() => { const id = `studio-${uid()}`; updateBank({ [mode]: [...items, { ...selected, id }] }); setSelectedId(id) }}>Duplicar</button><button onClick={() => { updateBank({ [mode]: items.filter(q => q.id !== selected.id) }); setSelectedId("") }}>Quitar (se puede deshacer)</button></> : <p>Seleccioná un elemento para editar su contenido o sus imágenes.</p>}</div></div>
    </>}{issues.length > 0 && <details><summary>{issues.length} avisos antes de aplicar</summary>{issues.slice(0,20).map((issue, i) => <p key={i}>{issue}</p>)}</details>}</div>
  </section>
}

import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react"

import CustomPageScreen from "@/components/CustomPageScreen"
import type { CustomPage, CustomPageBlock, CustomPageDestination } from "@/content/appBuilder/customPages"

import { loadBuilderSnapshots, saveBuilderSnapshot } from "./builderSnapshots"
import { useHistoryState } from "./useHistoryState"

const DRAFT_KEY = "odontoma-custom-pages-draft-v1"

type Selection = { kind: "page"; id: string } | { kind: "block"; pageId: string; id: string }
type Device = "desktop" | "tablet" | "phone"
type PageTemplate = "simple" | "menu" | "lesson"

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}`
}

function readDraft() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")
    return Array.isArray(value) ? value as CustomPage[] : null
  } catch {
    return null
  }
}

function defaultBlock(type: CustomPageBlock["type"]): CustomPageBlock {
  const base = { id: id(type), type }
  if (type === "heading") return { ...base, title: "Nuevo título" }
  if (type === "text") return { ...base, text: "Escribí aquí el contenido de esta sección." }
  if (type === "button") return { ...base, title: "Nuevo botón", text: "Descripción opcional", symbol: "→", accentColor: "#8b5cf6", destination: "home" }
  if (type === "callout") return { ...base, title: "Dato importante", text: "Agregá una nota, instrucción o recordatorio.", symbol: "!", accentColor: "#f59e0b" }
  return base
}

export default function CustomPagesEditor() {
  const history = useHistoryState<CustomPage[]>([])
  const [applied, setApplied] = useState<CustomPage[]>([])
  const [selection, setSelection] = useState<Selection | null>(null)
  const [status, setStatus] = useState("Cargando pantallas…")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [device, setDevice] = useState<Device>("desktop")
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState(() => loadBuilderSnapshots().filter(item => item.area === "custom-pages"))

  useEffect(() => {
    fetch("/__odontoma-builder/custom-pages")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<CustomPage[]>
      })
      .then(value => {
        const draft = readDraft()
        setApplied(value)
        history.reset(draft || value)
        setLoaded(true)
        setStatus(draft ? "Se recuperó tu borrador de pantallas." : "Podés crear una pantalla desde cero usando bloques.")
      })
      .catch(() => {
        setLoaded(true)
        setStatus("No se pudieron cargar las pantallas personalizadas.")
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded) return
    if (JSON.stringify(history.state) === JSON.stringify(applied)) localStorage.removeItem(DRAFT_KEY)
    else localStorage.setItem(DRAFT_KEY, JSON.stringify(history.state))
  }, [applied, history.state, loaded])

  const selectedPageId = selection?.kind === "page" ? selection.id : selection?.pageId
  const selectedPage = history.state.find(page => page.id === selectedPageId)
  const selectedBlock = selection?.kind === "block"
    ? selectedPage?.blocks.find(block => block.id === selection.id)
    : undefined
  const changed = JSON.stringify(history.state) !== JSON.stringify(applied)
  const issues = useMemo(() => history.state.flatMap(page => [
    !page.title.trim() ? `La pantalla ${page.id} necesita título.` : "",
    !page.eyebrow.trim() ? `La pantalla ${page.title || page.id} necesita etiqueta.` : "",
    ...page.blocks.map(block => block.type !== "divider" && !block.title?.trim() && !block.text?.trim()
      ? `Hay un bloque vacío en ${page.title}.`
      : "")
  ]).filter(Boolean), [history.state])

  const changes = useMemo(() => {
    if (!changed) return []
    const result: string[] = []
    for (const page of history.state) {
      const previous = applied.find(item => item.id === page.id)
      if (!previous) result.push(`＋ Pantalla “${page.title}”`)
      else if (JSON.stringify(previous) !== JSON.stringify(page)) result.push(`✎ Pantalla “${page.title}”`)
    }
    for (const page of applied) {
      if (!history.state.some(item => item.id === page.id)) result.push(`− Pantalla “${page.title}”`)
    }
    return result.slice(0, 12)
  }, [applied, changed, history.state])

  function addPage(template: PageTemplate = "simple") {
    const blocks = template === "menu"
      ? [defaultBlock("heading"), defaultBlock("text"), defaultBlock("button"), defaultBlock("button")]
      : template === "lesson"
        ? [defaultBlock("heading"), defaultBlock("text"), defaultBlock("callout"), defaultBlock("divider"), defaultBlock("text")]
        : [defaultBlock("heading"), defaultBlock("text")]
    const page: CustomPage = {
      id: id("page"),
      eyebrow: template === "menu" ? "MENÚ" : template === "lesson" ? "CONTENIDO" : "NUEVA PANTALLA",
      title: template === "menu" ? "Nuevo menú" : template === "lesson" ? "Nueva guía" : "Mi nueva pantalla",
      description: "Agregá una descripción para orientar al estudiante.",
      accentColor: "#8b5cf6",
      blocks
    }
    history.setState(current => [...current, page])
    setSelection({ kind: "page", id: page.id })
    setStatus("Pantalla creada en el borrador.")
  }

  function updatePage(changes: Partial<CustomPage>) {
    if (!selectedPage) return
    history.setState(current => current.map(page => page.id === selectedPage.id ? { ...page, ...changes } : page))
  }

  function deletePage() {
    if (!selectedPage) return
    history.setState(current => current.filter(page => page.id !== selectedPage.id))
    setSelection(null)
    setStatus(`“${selectedPage.title}” se quitó del borrador.`)
  }

  function addBlock(type: CustomPageBlock["type"]) {
    if (!selectedPage) return
    const block = defaultBlock(type)
    updatePage({ blocks: [...selectedPage.blocks, block] })
    setSelection({ kind: "block", pageId: selectedPage.id, id: block.id })
  }

  function updateBlock(changes: Partial<CustomPageBlock>) {
    if (!selectedPage || !selectedBlock) return
    updatePage({ blocks: selectedPage.blocks.map(block => block.id === selectedBlock.id ? { ...block, ...changes } : block) })
  }

  function duplicateBlock() {
    if (!selectedPage || !selectedBlock) return
    const duplicate = { ...selectedBlock, id: id(selectedBlock.type), title: selectedBlock.title ? `${selectedBlock.title} copia` : selectedBlock.title }
    const index = selectedPage.blocks.findIndex(block => block.id === selectedBlock.id)
    const blocks = [...selectedPage.blocks]
    blocks.splice(index + 1, 0, duplicate)
    updatePage({ blocks })
    setSelection({ kind: "block", pageId: selectedPage.id, id: duplicate.id })
  }

  function deleteBlock() {
    if (!selectedPage || !selectedBlock) return
    updatePage({ blocks: selectedPage.blocks.filter(block => block.id !== selectedBlock.id) })
    setSelection({ kind: "page", id: selectedPage.id })
  }

  function moveBlock(blockId: string, targetId: string) {
    if (!selectedPage || blockId === targetId) return
    const blocks = [...selectedPage.blocks]
    const sourceIndex = blocks.findIndex(block => block.id === blockId)
    const targetIndex = blocks.findIndex(block => block.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return
    const [block] = blocks.splice(sourceIndex, 1)
    blocks.splice(targetIndex, 0, block)
    updatePage({ blocks })
  }

  async function apply() {
    if (issues.length > 0) return
    setSaving(true)
    setStatus("Aplicando pantallas…")
    try {
      setSnapshots(saveBuilderSnapshot("custom-pages", applied).filter(item => item.area === "custom-pages"))
      const response = await fetch("/__odontoma-builder/custom-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(history.state)
      })
      if (!response.ok) throw new Error(await response.text())
      setApplied(history.state)
      localStorage.removeItem(DRAFT_KEY)
      setStatus("Pantallas aplicadas al proyecto. Snapshot automático creado.")
    } catch (error) {
      setStatus(error instanceof Error ? `No se pudo aplicar: ${error.message}` : "No se pudo aplicar.")
    } finally {
      setSaving(false)
    }
  }

  function restoreSnapshot(snapshotId: string) {
    const snapshot = loadBuilderSnapshots().find(item => item.id === snapshotId && item.area === "custom-pages")
    if (!snapshot || !Array.isArray(snapshot.data)) return
    history.reset(snapshot.data as CustomPage[])
    setSelection(null)
    setStatus("Versión anterior recuperada como borrador.")
  }

  function discard() {
    history.reset(applied)
    setSelection(null)
    localStorage.removeItem(DRAFT_KEY)
    setStatus("Borrador descartado. Volviste a las pantallas aplicadas.")
  }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) history.redo()
        else history.undo()
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault()
        history.redo()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [history])

  return (
    <section className="page-builder">
      <aside className="page-library">
        <div className="page-library-header"><div><p className="eyebrow">PANTALLAS</p><h2>Tus páginas</h2></div><button onClick={() => addPage()}>＋</button></div>
        <div className="page-template-buttons">
          <button onClick={() => addPage("simple")}><strong>Página</strong><span>Título y texto</span></button>
          <button onClick={() => addPage("menu")}><strong>Menú</strong><span>Botones enlazados</span></button>
          <button onClick={() => addPage("lesson")}><strong>Guía</strong><span>Contenido y tarjetas</span></button>
        </div>
        {history.state.length === 0 && <p className="page-library-empty">Elegí una plantilla para crear la primera pantalla.</p>}
        {history.state.map(page => (
          <button key={page.id} className={selectedPage?.id === page.id ? "active" : ""} onClick={() => setSelection({ kind: "page", id: page.id })}>
            <strong>{page.title}</strong><span>{page.blocks.length} bloques</span>
          </button>
        ))}
        {snapshots.length > 0 && <div className="snapshot-list"><p className="eyebrow">VERSIONES AUTOMÁTICAS</p>{snapshots.map(snapshot => <button key={snapshot.id} onClick={() => restoreSnapshot(snapshot.id)}><span>{new Date(snapshot.createdAt).toLocaleString()}</span><strong>Restaurar</strong></button>)}</div>}
      </aside>

      <div className="page-stage">
        <div className="page-toolbar">
          <div className="history-controls">
            <button onClick={history.undo} disabled={!history.canUndo}>↶ Deshacer</button>
            <button onClick={history.redo} disabled={!history.canRedo}>↷ Rehacer</button>
          </div>
          <div className="device-switcher">
            <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>Computadora</button>
            <button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")}>Tablet</button>
            <button className={device === "phone" ? "active" : ""} onClick={() => setDevice("phone")}>Teléfono</button>
          </div>
        </div>

        {selectedPage ? (
          <>
            <div className="block-add-toolbar">
              <span>Agregar:</span>
              <button onClick={() => addBlock("heading")}>Título</button><button onClick={() => addBlock("text")}>Texto</button><button onClick={() => addBlock("button")}>Botón</button><button onClick={() => addBlock("callout")}>Tarjeta</button><button onClick={() => addBlock("divider")}>Separador</button>
            </div>
            <div className={`custom-page-preview device-${device}`}>
              <CustomPageScreen page={selectedPage} onBack={() => undefined} onMainMenu={() => undefined} onNavigate={() => undefined} />
              <div className="block-overlay-list">
                {selectedPage.blocks.map(block => (
                  <button draggable key={block.id} className={selectedBlock?.id === block.id ? "active" : ""} onDragStart={() => setDraggedBlockId(block.id)} onDragOver={event => event.preventDefault()} onDrop={(event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); if (draggedBlockId) moveBlock(draggedBlockId, block.id); setDraggedBlockId(null) }} onClick={() => setSelection({ kind: "block", pageId: selectedPage.id, id: block.id })}>
                    <span>⠿</span>{block.type} · {block.title || block.text?.slice(0, 35) || "separador"}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : <div className="page-stage-empty"><span>▤</span><h2>Creá o elegí una pantalla</h2><p>Después agregá bloques prediseñados y enlazá sus botones.</p><button onClick={() => addPage()}>＋ Crear pantalla</button></div>}
      </div>

      <aside className="live-inspector page-inspector">
        {selectedPage ? <>
          <header className="inspector-header"><div><p className="eyebrow">{selectedBlock ? "BLOQUE" : "PANTALLA"}</p><h2>{selectedBlock?.title || selectedPage.title}</h2></div></header>
          <div className="inspector-fields">
            {!selectedBlock ? <>
              <Field label="Etiqueta"><input value={selectedPage.eyebrow} onChange={event => updatePage({ eyebrow: event.target.value })} /></Field>
              <Field label="Título"><input value={selectedPage.title} onChange={event => updatePage({ title: event.target.value })} /></Field>
              <Field label="Descripción"><textarea rows={4} value={selectedPage.description} onChange={event => updatePage({ description: event.target.value })} /></Field>
              <ColorField value={selectedPage.accentColor} onChange={accentColor => updatePage({ accentColor })} />
              <button className="inspector-delete" onClick={deletePage}>Eliminar pantalla completa</button>
            </> : <BlockFields block={selectedBlock} pages={history.state} onChange={updateBlock} onDuplicate={duplicateBlock} onDelete={deleteBlock} />}
          </div>
        </> : <div className="inspector-empty"><span>▤</span><h2>Constructor de pantallas</h2><p>Seleccioná una página o creá una nueva.</p></div>}
        <footer className="inspector-actions">
          <div className="inspector-status"><span className={`status-dot ${changed ? "active" : ""}`} /><p>{status}</p></div>
          {changes.length > 0 && <div className="pending-changes"><strong>{changes.length} cambios pendientes</strong>{changes.map(change => <span key={change}>{change}</span>)}</div>}
          {issues.length > 0 && <p className="validation-message">{issues[0]}</p>}
          <div className="actions"><button className="builder-button secondary" onClick={discard} disabled={saving || !changed}>Descartar</button><button className="builder-button apply" onClick={apply} disabled={saving || !changed || issues.length > 0}>{saving ? "Aplicando…" : "Aplicar al proyecto"}</button></div>
        </footer>
      </aside>
    </section>
  )
}

function BlockFields({ block, pages, onChange, onDuplicate, onDelete }: { block: CustomPageBlock; pages: CustomPage[]; onChange: (changes: Partial<CustomPageBlock>) => void; onDuplicate: () => void; onDelete: () => void }) {
  const destinations: Array<{ value: CustomPageDestination; label: string }> = [
    { value: "home", label: "Menú principal" }, { value: "quizzes", label: "Quizzes" }, { value: "flashcards", label: "Flashcards" }, { value: "multiple-choice", label: "Opción múltiple" }, { value: "open-ended", label: "Respuestas abiertas" }, { value: "my-quizzes", label: "My quizzes" }, ...pages.map(page => ({ value: `custom-page:${page.id}` as CustomPageDestination, label: `Pantalla: ${page.title}` }))
  ]
  return <>
    {(block.type === "heading" || block.type === "button" || block.type === "callout") && <Field label="Título"><input value={block.title || ""} onChange={event => onChange({ title: event.target.value })} /></Field>}
    {(block.type === "text" || block.type === "button" || block.type === "callout") && <Field label={block.type === "text" ? "Texto" : "Descripción"}><textarea rows={5} value={block.text || ""} onChange={event => onChange({ text: event.target.value })} /></Field>}
    {(block.type === "button" || block.type === "callout") && <><Field label="Símbolo"><input value={block.symbol || ""} onChange={event => onChange({ symbol: event.target.value })} /></Field><ColorField value={block.accentColor || "#8b5cf6"} onChange={accentColor => onChange({ accentColor })} /></>}
    {block.type === "button" && <Field label="¿Qué abre?"><select value={block.destination || "home"} onChange={event => onChange({ destination: event.target.value as CustomPageDestination })}>{destinations.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>}
    <div className="structure-actions"><button onClick={onDuplicate}>＋ Duplicar bloque</button><button className="danger" onClick={onDelete}>− Eliminar bloque</button></div>
  </>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="inspector-field"><span><strong>{label}</strong></span>{children}</label>
}

function ColorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <Field label="Color"><span className="inspector-color-row"><input type="color" value={value} onChange={event => onChange(event.target.value)} /><code>{value.toUpperCase()}</code></span></Field>
}

import { writeBrowserStorage } from "../lib/storageSafety"
import { useEffect, useMemo, useState } from "react"
import { useDraftStatus } from "./draftStatus"
import { addWrittenContent, type CreationEvent } from "./contentCreation"
import { publishIndex, useWorkspaceHistory, type WorkspaceTarget } from "./workspaceBridge"
import { useHistoryState } from "./useHistoryState"
import { ImageField } from "./LibraryEditor"
import WrittenBatchTools from "./WrittenBatchTools"
import "./written-editor.css"
import { normalizeWrittenForSave, validateWrittenContent } from "@/content/openQuizzes/validation"

import type {
  OpenQuizContent,
  OpenQuizClass,
  OpenQuizDeck,
  OpenQuizQuestion
} from "@/content/openQuizzes"
import { groupWrittenDecks, moveWrittenDeck, setWrittenCategories, writtenCategoryId } from "@/content/openQuizzes/categories"
import WrittenCategoriesEditor from "./WrittenCategoriesEditor"

const CONTENT_DRAFT_KEY = "odontoma-open-quiz-builder-draft-v1"

const emptyContent: OpenQuizContent = { classes: [], decks: [] }
const DEFAULT_CLASS_SYMBOL = "▰"
const DEFAULT_CLASS_COLOR = "#fbbf24"

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}`
}

function readDraft() {
  try {
    const raw = localStorage.getItem(CONTENT_DRAFT_KEY)
    return raw ? JSON.parse(raw) as OpenQuizContent : null
  } catch {
    return null
  }
}

function normalizeContent(value: OpenQuizContent): OpenQuizContent {
  const classes = [...(value.classes || [])]
  const knownNames = new Set(classes.map(item => item.name.trim().toLocaleLowerCase()))
  const decks = value.decks.map(deck => ({
    ...deck,
    questions: deck.questions.map(question => ({
      ...question,
      acceptedPoints: [...question.acceptedPoints]
    }))
  }))

  for (const deck of decks) {
    const name = deck.subject.trim() || "General"
    const normalizedName = name.toLocaleLowerCase()
    if (knownNames.has(normalizedName)) continue

    classes.push({
      id: newId("open-class"),
      name,
      symbol: deck.classSymbol || DEFAULT_CLASS_SYMBOL,
      color: deck.classColor || DEFAULT_CLASS_COLOR
    })
    knownNames.add(normalizedName)
  }

  return { classes, decks }
}

export default function OpenQuizContentEditor({ active = true, target }: { active?: boolean; target?: WorkspaceTarget }) {
  const contentHistory = useHistoryState<OpenQuizContent>(emptyContent, 80, "written")
  useWorkspaceHistory(active, contentHistory)
  const { state: content, setState: setContent, reset: resetContent } = contentHistory
  const [appliedContent, setAppliedContent] = useState<OpenQuizContent>(emptyContent)
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null)
  const [classNameDraft, setClassNameDraft] = useState("")
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [status, setStatus] = useState("Cargando contenido…")
  const [publishing, setPublishing] = useState(false)
  const [contentLoaded, setContentLoaded] = useState(false)
  useDraftStatus("written", contentLoaded, content, appliedContent)
  useEffect(() => {
    const create = (e: Event) => {
      const d = (e as CustomEvent<CreationEvent>).detail, r = d.request
      if (!contentLoaded || r.type !== "written") return
      try {
        setContent(addWrittenContent(content, r, () => newId("open"))); setStatus("Cuestionario agregado al borrador. Guardá para aplicarlo.")
        d.accepted = true; d.target = { panel: "written", id: r.deckId, subject: r.subject }
      } catch (error) { d.error = String(error) }
    }
    const existing = (e: Event) => { const d = (e as CustomEvent).detail; if (d.type === "written") d.texts = content.decks.find(deck => deck.id === d.deckId)?.questions.map(q => q.prompt) || [] }
    window.addEventListener("odontoma-create-content", create); window.addEventListener("odontoma-import-existing", existing)
    return () => { window.removeEventListener("odontoma-create-content", create); window.removeEventListener("odontoma-import-existing", existing) }
  }, [content, contentLoaded, setContent])
  useEffect(() => { const flush = (event: Event) => { if (contentLoaded) (event as CustomEvent<{ files: Record<string, unknown> }>).detail.files.written = content }; window.addEventListener("odontoma-flush-drafts", flush); return () => window.removeEventListener("odontoma-flush-drafts", flush) }, [content, contentLoaded])

  useEffect(() => {
    fetch("/__odontoma-builder/open-quizzes")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<OpenQuizContent>
      })
      .then(value => {
        const draft = readDraft()
        const applied = normalizeContent(value)
        const initial = normalizeContent(draft || value)
        setContentLoaded(true)

        setAppliedContent(applied)
        resetContent(initial)
        setSelectedClassName(initial.classes?.[0]?.name || null)
        setClassNameDraft(initial.classes?.[0]?.name || "")
        setSelectedDeckId(initial.decks.find(deck => deck.subject === initial.classes?.[0]?.name)?.id || null)
        setStatus(
          draft
            ? "Se recuperó tu borrador local."
            : "Contenido sincronizado con el proyecto."
        )
      })
      .catch(() => {
        setStatus("No se pudo abrir el archivo de contenido local.")
      })
  }, [resetContent])

  /* eslint-disable react-hooks/set-state-in-effect -- Select an externally requested class/deck after loading. */
  useEffect(() => {
    if (!contentLoaded || !target) return
    const selected = target.id ? content.decks.find(d => d.id === target.id) : undefined
    const name = selected?.subject || target.subject
    if (name) { setSelectedClassName(name); setClassNameDraft(name); setSelectedDeckId(selected?.id || content.decks.find(d => d.subject === name)?.id || null); setSelectedQuestionId(null) }
  }, [target, contentLoaded]) // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (contentLoaded) publishIndex("written", { classes: content.classes, decks: content.decks.map(d => ({ id: d.id, title: d.title, subject: d.subject, partial: d.partial, categoryId: d.categoryId })) }) }, [content, contentLoaded])
  const classes = useMemo(() => {
    const grouped = new Map<string, OpenQuizDeck[]>()

    for (const deck of content.decks) {
      const className = deck.subject.trim() || "General"
      grouped.set(className, [...(grouped.get(className) || []), deck])
    }

    return (content.classes || []).map(item => ({
      ...item,
      decks: grouped.get(item.name) || []
    }))
  }, [content])

  const selectedClass = classes.find(item => item.name === selectedClassName)
  const selectedClassGroups = useMemo(() => groupWrittenDecks(selectedClass?.decks || [], selectedClass?.categories), [selectedClass])

  const selectedDeck = content.decks.find(deck => deck.id === selectedDeckId)
  const selectedQuestion = selectedDeck?.questions.find(
    question => question.id === selectedQuestionId
  )

  const validationIssues = useMemo(() => validateWrittenContent(content), [content])

  function uniqueClassName() {
    const used = new Set(classes.map(item => item.name.toLocaleLowerCase()))
    let candidate = "Nueva clase"
    let number = 2

    while (used.has(candidate.toLocaleLowerCase())) {
      candidate = `Nueva clase ${number}`
      number += 1
    }

    return candidate
  }

  function addClass() {
    const className = uniqueClassName()
    const classItem: OpenQuizClass = {
      id: newId("open-class"),
      name: className,
      symbol: DEFAULT_CLASS_SYMBOL,
      color: DEFAULT_CLASS_COLOR
    }

    setContent(current => ({
      ...current,
      classes: [...(current.classes || []), classItem]
    }))
    setSelectedClassName(className)
    setClassNameDraft(className)
    setSelectedDeckId(null)
    setSelectedQuestionId(null)
    setStatus("Clase creada. Ahora podés agregarle cuestionarios.")
  }

  function renameClass() {
    if (!selectedClass || !classNameDraft.trim()) return

    const nextName = classNameDraft.trim()
    const duplicate = classes.some(item =>
      item.name !== selectedClass.name &&
      item.name.toLocaleLowerCase() === nextName.toLocaleLowerCase()
    )

    if (duplicate) {
      setStatus("Ya existe una clase con ese nombre.")
      return
    }

    setContent(current => ({
      classes: (current.classes || []).map(item =>
        item.id === selectedClass.id ? { ...item, name: nextName } : item
      ),
      decks: current.decks.map(deck =>
        (deck.subject.trim() || "General") === selectedClass.name
          ? { ...deck, subject: nextName }
          : deck
      )
    }))
    setSelectedClassName(nextName)
    setClassNameDraft(nextName)
    setStatus("Clase renombrada en el borrador.")
  }

  function deleteClass() {
    if (!selectedClass) return

    const confirmed = window.confirm(
      `¿Borrar la clase "${selectedClass.name}" y sus ${selectedClass.decks.length} cuestionario${selectedClass.decks.length === 1 ? "" : "s"}?`
    )
    if (!confirmed) return

    const remaining = content.decks.filter(deck =>
      (deck.subject.trim() || "General") !== selectedClass.name
    )
    const remainingClasses = (content.classes || []).filter(item => item.id !== selectedClass.id)
    const nextClassName = remainingClasses[0]?.name || null

    setContent({ classes: remainingClasses, decks: remaining })
    setSelectedClassName(nextClassName)
    setClassNameDraft(nextClassName || "")
    setSelectedDeckId(remaining.find(deck => deck.subject === nextClassName)?.id || null)
    setSelectedQuestionId(null)
    setStatus("Clase eliminada del borrador. Publicá para confirmar el cambio.")
  }

  function updateClassAppearance(changes: Partial<Pick<OpenQuizClass, "symbol" | "color">>) {
    if (!selectedClass) return

    setContent(current => ({
      classes: (current.classes || []).map(item =>
        item.id === selectedClass.id ? { ...item, ...changes } : item
      ),
      decks: current.decks.map(deck =>
        (deck.subject.trim() || "General") === selectedClass.name
          ? {
              ...deck,
              classSymbol: changes.symbol ?? deck.classSymbol,
              classColor: changes.color ?? deck.classColor
            }
          : deck
      )
    }))
    setStatus("Apariencia de la clase actualizada en el borrador.")
  }

  function addDeck() {
    if (!selectedClass) {
      addClass()
      return
    }

    const deck: OpenQuizDeck = {
      id: newId("open-deck"),
      title: "Nuevo cuestionario",
      subject: selectedClass.name,
      color: selectedClass.color || DEFAULT_CLASS_COLOR,
      classSymbol: selectedClass?.symbol || DEFAULT_CLASS_SYMBOL,
      classColor: selectedClass?.color || DEFAULT_CLASS_COLOR,
      description: "",
      questions: []
    }

    setContent(current => ({ ...current, decks: [...current.decks, deck] }))
    setSelectedDeckId(deck.id)
    setSelectedQuestionId(null)
    setStatus("Cuestionario creado dentro de la clase.")
  }

  function updateDeck(changes: Partial<OpenQuizDeck>) {
    if (!selectedDeckId) return

    setContent(current => ({
      ...current,
      decks: current.decks.map(deck =>
        deck.id === selectedDeckId
          ? { ...deck, ...changes }
          : deck
      )
    }))
  }

  function deleteDeck() {
    if (!selectedDeck) return

    const confirmed = window.confirm(
      `¿Borrar el apartado "${selectedDeck.title}" y todas sus preguntas del borrador?`
    )

    if (!confirmed) return

    const remaining = content.decks.filter(deck => deck.id !== selectedDeck.id)
    const nextDeck = remaining.find(deck =>
      (deck.subject.trim() || "General") === selectedClassName
    )
    setContent(current => ({ ...current, decks: remaining }))
    setSelectedDeckId(nextDeck?.id || null)
    setSelectedQuestionId(null)
    setStatus("Apartado eliminado del borrador. Aplicá para confirmar el cambio.")
  }

  function addQuestion() {
    if (!selectedDeck) return

    const question: OpenQuizQuestion = {
      id: newId("open-question"),
      prompt: "",
      modelAnswer: "",
      acceptedPoints: [],
      explanation: "",
      source: ""
    }

    updateDeck({ questions: [...selectedDeck.questions, question] })
    setSelectedQuestionId(question.id)
    setStatus("Pregunta agregada al borrador.")
  }

  function updateQuestion(changes: Partial<OpenQuizQuestion>) {
    if (!selectedDeck || !selectedQuestionId) return

    updateDeck({
      questions: selectedDeck.questions.map(question =>
        question.id === selectedQuestionId
          ? { ...question, ...changes }
          : question
      )
    })
  }

  function deleteQuestion() {
    if (!selectedDeck || !selectedQuestion) return

    const confirmed = window.confirm("¿Borrar esta pregunta del borrador?")
    if (!confirmed) return

    const remaining = selectedDeck.questions.filter(
      question => question.id !== selectedQuestion.id
    )

    updateDeck({ questions: remaining })
    setSelectedQuestionId(remaining[0]?.id || null)
    setStatus("Pregunta eliminada del borrador.")
  }

  function saveDraft() {
    if (!writeBrowserStorage(CONTENT_DRAFT_KEY, JSON.stringify(content))) return
    setStatus("Borrador guardado solo en esta máquina. Todavía no está publicado.")
  }

  async function publishContent() {
    if (validationIssues.length > 0) return

    setPublishing(true)
    setStatus("Publicando contenido…")
    const normalizedContent = normalizeWrittenForSave(normalizeContent(content))

    try {
      const response = await fetch("/__odontoma-builder/open-quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedContent)
      })

      if (!response.ok) throw new Error(await response.text())

      setContent(normalizedContent)
      setAppliedContent(normalizedContent)
      localStorage.removeItem(CONTENT_DRAFT_KEY)
      setStatus("Contenido publicado. Odontoma se actualizará automáticamente.")
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `No se pudo publicar: ${error.message}`
          : "No se pudo publicar el contenido."
      )
    } finally {
      setPublishing(false)
    }
  }

  function discardDraft() {
    setContent(appliedContent)
    setSelectedClassName(appliedContent.classes?.[0]?.name || null)
    setClassNameDraft(appliedContent.classes?.[0]?.name || "")
    setSelectedDeckId(appliedContent.decks.find(deck => deck.subject === appliedContent.classes?.[0]?.name)?.id || null)
    setSelectedQuestionId(null)
    localStorage.removeItem(CONTENT_DRAFT_KEY)
    setStatus("Borrador descartado. Volviste al contenido aplicado.")
  }

  return (
    <section className="content-builder">
      <aside className="content-sidebar">
        <div className="content-sidebar-heading">
          <div>
            <p className="eyebrow">CLASES</p>
            <h2>Preguntas abiertas</h2>
          </div>
          <button className="icon-add-button" onClick={addClass} title="Nueva clase" aria-label="Agregar clase">
            +
          </button>
        </div>

        <div className="content-sidebar-scroll">
          <div className="class-list">
          {classes.length === 0 ? (
            <div className="empty-builder-state">
              <strong>No hay clases</strong>
              <span>Creá la primera con el botón +.</span>
            </div>
          ) : classes.map(item => (
            <button
              key={item.name}
              className={`class-list-item ${item.name === selectedClassName ? "selected" : ""}`}
              onClick={() => {
                setSelectedClassName(item.name)
                setClassNameDraft(item.name)
                setSelectedDeckId(item.decks[0]?.id || null)
                setSelectedQuestionId(null)
              }}
            >
              <span
                className="class-folder-icon"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}20`,
                  borderColor: `${item.color}45`
                }}
              >
                {item.symbol}
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.decks.length} {item.decks.length === 1 ? "cuestionario" : "cuestionarios"}</small>
              </span>
            </button>
          ))}
          </div>

          {selectedClass && (
            <section className="class-management">
              <div className="sidebar-section-heading">
                <div>
                  <p className="eyebrow">CLASE SELECCIONADA</p>
                  <strong>{selectedClass.name}</strong>
                </div>
                <button className="small-add-button" onClick={addDeck}>+ Cuestionario</button>
              </div>

              <div className="class-name-editor">
                <input
                  value={classNameDraft}
                  onChange={event => setClassNameDraft(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") renameClass()
                  }}
                  aria-label="Nombre de la clase"
                />
                <button onClick={renameClass} disabled={!classNameDraft.trim()}>Renombrar</button>
              </div>

              <div className="class-style-editor">
                <label>
                  <span>Símbolo</span>
                  <input
                    value={selectedClass.symbol}
                    onChange={event => updateClassAppearance({
                      symbol: event.target.value || DEFAULT_CLASS_SYMBOL
                    })}
                    maxLength={8}
                    aria-label="Símbolo de la clase"
                  />
                </label>
                <label>
                  <span>Color</span>
                  <span className="class-color-control">
                    <input
                      type="color"
                      value={selectedClass.color}
                      onChange={event => updateClassAppearance({ color: event.target.value })}
                      aria-label="Color de la clase"
                    />
                    <code>{selectedClass.color.toUpperCase()}</code>
                  </span>
                </label>
              </div>

              <WrittenCategoriesEditor key={selectedClass.id} content={content} subject={selectedClass.name} onChange={setContent}/>
              <div className="deck-list">
                {selectedClassGroups.categories.map(group => (
                  <div key={group.id}>
                    <p className="eyebrow" style={{ margin: "18px 0 8px" }}>{group.name}</p>
                    {group.decks.map((deck, index) => (
                      <div key={deck.id} className="written-deck-row">
                      <button
                        key={deck.id}
                        className={`deck-list-item ${deck.id === selectedDeckId ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedDeckId(deck.id)
                          setSelectedQuestionId(null)
                        }}
                      >
                        <strong>{deck.title || "Sin título"}</strong>
                        <span>{deck.questions.length} {deck.questions.length === 1 ? "pregunta" : "preguntas"}</span>
                      </button>
                      <div className="written-order-buttons">
                        <button type="button" aria-label={`Subir cuestionario ${deck.title}`} disabled={index === 0} onClick={() => setContent(current => moveWrittenDeck(current, deck.id, -1))}>↑</button>
                        <button type="button" aria-label={`Bajar cuestionario ${deck.title}`} disabled={index === group.decks.length - 1} onClick={() => setContent(current => moveWrittenDeck(current, deck.id, 1))}>↓</button>
                      </div>
                      </div>
                    ))}
                  </div>
                ))}
                {selectedClassGroups.ungrouped.length > 0 && selectedClassGroups.categories.length > 0 && (
                  <p className="eyebrow" style={{ margin: "18px 0 8px" }}>SIN CATEGORÍA</p>
                )}
                {selectedClassGroups.ungrouped.map((deck, index) => (
                  <div key={deck.id} className="written-deck-row">
                  <button
                    key={deck.id}
                    className={`deck-list-item ${deck.id === selectedDeckId ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedDeckId(deck.id)
                      setSelectedQuestionId(null)
                    }}
                  >
                    <strong>{deck.title || "Sin título"}</strong>
                    <span>{deck.questions.length} {deck.questions.length === 1 ? "pregunta" : "preguntas"}</span>
                  </button>
                  <div className="written-order-buttons">
                    <button type="button" aria-label={`Subir cuestionario ${deck.title}`} disabled={index === 0} onClick={() => setContent(current => moveWrittenDeck(current, deck.id, -1))}>↑</button>
                    <button type="button" aria-label={`Bajar cuestionario ${deck.title}`} disabled={index === selectedClassGroups.ungrouped.length - 1} onClick={() => setContent(current => moveWrittenDeck(current, deck.id, 1))}>↓</button>
                  </div>
                  </div>
                ))}
              </div>

              <button className="delete-class-button" onClick={deleteClass}>
                Eliminar clase completa
              </button>
            </section>
          )}
        </div>

        <div className="content-sidebar-status">
          <span className="status-dot active" />
          <p>{status}</p>
        </div>
      </aside>

      <section className="content-editor-panel">
        {!selectedDeck ? (
          <div className="content-welcome">
            <span>✎</span>
            <h2>{selectedClass ? `${selectedClass.name} está lista` : "Creá tu primera clase"}</h2>
            <p>{selectedClass ? "Esta clase todavía no tiene cuestionarios." : "Dentro de ella podrás agregar cuestionarios, preguntas, respuestas y criterios."}</p>
            <button className="builder-button apply" onClick={selectedClass ? addDeck : addClass}>
              {selectedClass ? "Agregar primer cuestionario" : "Nueva clase"}
            </button>
          </div>
        ) : (
          <>
            <header className="content-editor-header">
              <div>
                <p className="eyebrow">CONFIGURACIÓN DEL CUESTIONARIO</p>
                <h2>{selectedDeck.title || "Sin título"}</h2>
              </div>
              <button className="builder-button danger" onClick={deleteDeck}>
                Eliminar cuestionario
              </button>
            </header>

            <div className="deck-fields">
              <BuilderField label="Título">
                <input
                  value={selectedDeck.title}
                  onChange={event => updateDeck({ title: event.target.value })}
                  placeholder="Ej: Hemostasia · preguntas de desarrollo"
                />
              </BuilderField>
              <BuilderField label="Clase" hint="Podés mover este cuestionario a otra clase.">
                <select
                  value={selectedDeck.subject}
                  onChange={event => {
                    const nextClass = event.target.value
                    updateDeck({ subject: nextClass, categoryId: null })
                    setSelectedClassName(nextClass)
                    setClassNameDraft(nextClass)
                  }}
                >
                  {classes.map(item => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </BuilderField>
              <BuilderField label="Categoría" hint="Creá, renombrá y ordená las carpetas en Categorías y orden, a la izquierda. Los parciales actuales se conservan.">
                <select
                  aria-label="Categoría del cuestionario"
                  value={writtenCategoryId(selectedDeck) ?? ""}
                  onChange={event => {
                    const categoryId = event.target.value || null
                    setContent(current => ({ ...setWrittenCategories(current, selectedDeck.subject, selectedClassGroups.categories.map(({ id, name }) => ({ id, name }))), decks: current.decks.map(deck => deck.id === selectedDeck.id ? { ...deck, categoryId } : deck) }))
                  }}
                >
                  <option value="">Sin categoría</option>
                  {selectedClassGroups.categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </BuilderField>
              <BuilderField
                label="Color del cuestionario"
                hint={selectedDeck.color ? "Color propio." : "Está usando el color de la clase."}
              >
                <div className="deck-color-editor">
                  <span className="class-color-control">
                    <input
                      type="color"
                      value={selectedDeck.color || selectedClass?.color || DEFAULT_CLASS_COLOR}
                      onChange={event => updateDeck({ color: event.target.value })}
                      aria-label="Color del cuestionario"
                    />
                    <code>{(selectedDeck.color || selectedClass?.color || DEFAULT_CLASS_COLOR).toUpperCase()}</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => updateDeck({ color: undefined })}
                    disabled={!selectedDeck.color}
                  >
                    Usar color de la clase
                  </button>
                </div>
              </BuilderField>
              <BuilderField label="Descripción">
                <WrittenBatchTools key={selectedDeck.id} deck={selectedDeck} onChange={questions => updateDeck({ questions })} />
                <textarea
                  value={selectedDeck.description || ""}
                  onChange={event => updateDeck({ description: event.target.value })}
                  placeholder="Qué cubre este apartado…"
                  rows={2}
                />
              </BuilderField>
            </div>

            <div className="question-workspace">
              <aside className="question-list-panel">
                <div className="question-list-heading">
                  <div>
                    <p className="eyebrow">PREGUNTAS</p>
                    <strong>{selectedDeck.questions.length}</strong>
                  </div>
                  <button className="small-add-button" onClick={addQuestion}>
                    + Agregar
                  </button>
                </div>

                <div className="question-list">
                  {selectedDeck.questions.length === 0 ? (
                    <div className="empty-builder-state compact">
                      <span>Agregá la primera pregunta.</span>
                    </div>
                  ) : selectedDeck.questions.map((question, index) => (
                    <button
                      key={question.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData("text/plain", question.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const from = selectedDeck.questions.findIndex(q => q.id === e.dataTransfer.getData("text/plain")); if (from < 0) return; const list = [...selectedDeck.questions]; const [item] = list.splice(from, 1); list.splice(index, 0, item); updateDeck({ questions: list }) }}
                      className={`question-list-item ${question.id === selectedQuestionId ? "selected" : ""}`}
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <span>{index + 1}</span>
                      <strong>{question.prompt || "Pregunta sin escribir"}</strong>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="question-editor">
                {!selectedQuestion ? (
                  <div className="question-empty">
                    <p>Seleccioná una pregunta o agregá una nueva.</p>
                    <button className="builder-button apply" onClick={addQuestion}>
                      Agregar pregunta
                    </button>
                  </div>
                ) : (
                  <div className="question-form">
                    <div className="question-form-heading">
                      <div>
                        <p className="eyebrow">EDICIÓN</p>
                        <h3>Pregunta abierta</h3>
                      </div>
                      <button className="text-delete-button" onClick={deleteQuestion}>
                        Eliminar
                      </button>
                    </div>

                    <BuilderField label="Pregunta" required>
                      <div className="actions"><button type="button" onClick={() => { const copy = { ...selectedQuestion, id: `open-${crypto.randomUUID()}` }; updateDeck({ questions: [...selectedDeck.questions, copy] }); setSelectedQuestionId(copy.id) }}>Duplicar</button>{[-1,1].map(step => <button type="button" key={step} onClick={() => { const list = [...selectedDeck.questions]; const from = list.findIndex(q => q.id === selectedQuestion.id); const to = from + step; if (to < 0 || to >= list.length) return; [list[from], list[to]] = [list[to], list[from]]; updateDeck({ questions: list }) }}>{step < 0 ? "↑ Mover arriba" : "↓ Mover abajo"}</button>)}</div>
                      <textarea
                        value={selectedQuestion.prompt}
                        onChange={event => updateQuestion({ prompt: event.target.value })}
                        placeholder="Escribí el enunciado tal como lo verá el estudiante…"
                        rows={3}
                      />
                    </BuilderField>

                    <ImageField label="Imagen de la pregunta" value={selectedQuestion.image} onChange={image => updateQuestion({ image })} />
                    <BuilderField label="Descripción de la imagen de la pregunta (opcional)">
                      <input value={selectedQuestion.imageAlt || ""} onChange={event => updateQuestion({ imageAlt: event.target.value })} />
                    </BuilderField>

                    <BuilderField label="Respuesta modelo" required hint="La respuesta completa que se mostrará después.">
                      <textarea
                        value={selectedQuestion.modelAnswer}
                        onChange={event => updateQuestion({ modelAnswer: event.target.value })}
                        placeholder="Respuesta esperada…"
                        rows={5}
                      />
                    </BuilderField>

                    <ImageField label="Imagen de la respuesta" value={selectedQuestion.backImage} onChange={backImage => updateQuestion({ backImage })} />
                    <p className="text-sm text-zinc-400">Esta imagen solo se muestra al revelar la respuesta modelo y en la revisión del examen.</p>
                    <BuilderField label="Descripción de la imagen de la respuesta (opcional)">
                      <input value={selectedQuestion.backImageAlt || ""} onChange={event => updateQuestion({ backImageAlt: event.target.value })} />
                    </BuilderField>

                    <BuilderField
                      label="También considero correcto mencionar"
                      hint="Un criterio por línea. Podés dejarlo vacío."
                    >
                      <textarea
                        value={selectedQuestion.acceptedPoints.join("\n")}
                        onChange={event => updateQuestion({
                          acceptedPoints: event.target.value.split("\n")
                        })}
                        placeholder={"Ej: Describe el papel del factor XII\nRelaciona plasmina con fibrinólisis"}
                        rows={4}
                      />
                    </BuilderField>

                    <BuilderField label="Explicación opcional">
                      <textarea
                        value={selectedQuestion.explanation || ""}
                        onChange={event => updateQuestion({ explanation: event.target.value })}
                        placeholder="Aclaración que ayude a comprender la respuesta…"
                        rows={3}
                      />
                    </BuilderField>

                    <BuilderField label="Fuente opcional">
                      <input
                        value={selectedQuestion.source || ""}
                        onChange={event => updateQuestion({ source: event.target.value })}
                        placeholder="Ej: Robbins, cap. 4, p. 126"
                      />
                    </BuilderField>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        <footer className="content-actions">
          <div>
            {validationIssues.length > 0 ? (
              <p className="validation-message">{validationIssues.join(" ")}</p>
            ) : (
              <p>Guardá el borrador para continuar después o publicalo cuando esté listo.</p>
            )}
          </div>
          <div className="actions">
            <button className="builder-button secondary" onClick={contentHistory.undo} disabled={!contentHistory.canUndo}>↶ Deshacer</button>
            <button className="builder-button secondary" onClick={contentHistory.redo} disabled={!contentHistory.canRedo}>↷ Rehacer</button>
            <button className="builder-button secondary" onClick={discardDraft} disabled={publishing}>
              Descartar borrador
            </button>
            <button
              className="builder-button secondary"
              onClick={saveDraft}
              disabled={publishing}
            >
              Guardar borrador
            </button>
            <button
              className="builder-button apply"
              onClick={publishContent}
              disabled={publishing || validationIssues.length > 0}
            >
              {publishing ? "Guardando…" : "Aplicar al proyecto local"}
            </button>
          </div>
        </footer>
      </section>
    </section>
  )
}

function BuilderField({
  label,
  hint,
  required,
  children
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="builder-field">
      <span className="builder-field-heading">
        <strong>{label}{required ? " *" : ""}</strong>
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  )
}

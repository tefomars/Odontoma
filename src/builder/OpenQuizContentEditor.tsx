import { useEffect, useMemo, useState } from "react"

import type {
  OpenQuizContent,
  OpenQuizDeck,
  OpenQuizQuestion
} from "@/content/openQuizzes"

const CONTENT_DRAFT_KEY = "odontoma-open-quiz-builder-draft-v1"

const emptyContent: OpenQuizContent = { decks: [] }

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

export default function OpenQuizContentEditor() {
  const [content, setContent] = useState<OpenQuizContent>(emptyContent)
  const [appliedContent, setAppliedContent] = useState<OpenQuizContent>(emptyContent)
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null)
  const [classNameDraft, setClassNameDraft] = useState("")
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [status, setStatus] = useState("Cargando contenido…")
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetch("/__odontoma-builder/open-quizzes")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<OpenQuizContent>
      })
      .then(value => {
        const draft = readDraft()
        const initial = draft || value

        setAppliedContent(value)
        setContent(initial)
        setSelectedClassName(initial.decks[0]?.subject.trim() || null)
        setClassNameDraft(initial.decks[0]?.subject.trim() || "")
        setSelectedDeckId(initial.decks[0]?.id || null)
        setStatus(
          draft
            ? "Se recuperó tu borrador local."
            : "Contenido sincronizado con el proyecto."
        )
      })
      .catch(() => {
        setStatus("No se pudo abrir el archivo de contenido local.")
      })
  }, [])

  const classes = useMemo(() => {
    const grouped = new Map<string, OpenQuizDeck[]>()

    for (const deck of content.decks) {
      const className = deck.subject.trim() || "General"
      grouped.set(className, [...(grouped.get(className) || []), deck])
    }

    return [...grouped.entries()].map(([name, decks]) => ({ name, decks }))
  }, [content])

  const selectedClass = classes.find(item => item.name === selectedClassName)

  const selectedDeck = content.decks.find(deck => deck.id === selectedDeckId)
  const selectedQuestion = selectedDeck?.questions.find(
    question => question.id === selectedQuestionId
  )

  const validationIssues = useMemo(() => {
    const issues: string[] = []

    for (const deck of content.decks) {
      if (!deck.title.trim()) issues.push("Cada apartado necesita un título.")
      if (!deck.subject.trim()) issues.push("Cada apartado debe pertenecer a una clase.")

      for (const question of deck.questions) {
        if (!question.prompt.trim()) issues.push("Hay una pregunta sin enunciado.")
        if (!question.modelAnswer.trim()) issues.push("Hay una pregunta sin respuesta modelo.")
      }
    }

    return [...new Set(issues)]
  }, [content])

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
    const deck: OpenQuizDeck = {
      id: newId("open-deck"),
      title: "Nuevo cuestionario",
      subject: className,
      description: "",
      questions: []
    }

    setContent(current => ({ decks: [...current.decks, deck] }))
    setSelectedClassName(className)
    setClassNameDraft(className)
    setSelectedDeckId(deck.id)
    setSelectedQuestionId(null)
    setStatus("Clase creada con su primer cuestionario en el borrador.")
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

    const removedIds = new Set(selectedClass.decks.map(deck => deck.id))
    const remaining = content.decks.filter(deck => !removedIds.has(deck.id))
    const nextClassName = remaining[0]?.subject.trim() || null

    setContent({ decks: remaining })
    setSelectedClassName(nextClassName)
    setClassNameDraft(nextClassName || "")
    setSelectedDeckId(remaining[0]?.id || null)
    setSelectedQuestionId(null)
    setStatus("Clase eliminada del borrador. Publicá para confirmar el cambio.")
  }

  function addDeck() {
    if (!selectedClassName) {
      addClass()
      return
    }

    const deck: OpenQuizDeck = {
      id: newId("open-deck"),
      title: "Nuevo cuestionario",
      subject: selectedClassName,
      description: "",
      questions: []
    }

    setContent(current => ({ decks: [...current.decks, deck] }))
    setSelectedDeckId(deck.id)
    setSelectedQuestionId(null)
    setStatus("Cuestionario creado dentro de la clase.")
  }

  function updateDeck(changes: Partial<OpenQuizDeck>) {
    if (!selectedDeckId) return

    setContent(current => ({
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
    ) || remaining[0]
    setContent({ decks: remaining })
    setSelectedClassName(nextDeck?.subject.trim() || null)
    setClassNameDraft(nextDeck?.subject.trim() || "")
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
    localStorage.setItem(CONTENT_DRAFT_KEY, JSON.stringify(content))
    setStatus("Borrador guardado solo en esta máquina. Todavía no está publicado.")
  }

  async function publishContent() {
    if (validationIssues.length > 0) return

    setPublishing(true)
    setStatus("Publicando contenido…")

    try {
      const response = await fetch("/__odontoma-builder/open-quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      })

      if (!response.ok) throw new Error(await response.text())

      setAppliedContent(content)
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
    setSelectedClassName(appliedContent.decks[0]?.subject.trim() || null)
    setClassNameDraft(appliedContent.decks[0]?.subject.trim() || "")
    setSelectedDeckId(appliedContent.decks[0]?.id || null)
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
              <span className="class-folder-icon">▰</span>
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

              <div className="deck-list">
                {selectedClass.decks.map(deck => (
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
            <h2>Creá tu primera clase</h2>
            <p>Dentro de ella podrás agregar cuestionarios, preguntas, respuestas y criterios.</p>
            <button className="builder-button apply" onClick={addClass}>
              Nueva clase
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
                    updateDeck({ subject: nextClass })
                    setSelectedClassName(nextClass)
                    setClassNameDraft(nextClass)
                  }}
                >
                  {classes.map(item => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </BuilderField>
              <BuilderField label="Descripción">
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
                      <textarea
                        value={selectedQuestion.prompt}
                        onChange={event => updateQuestion({ prompt: event.target.value })}
                        placeholder="Escribí el enunciado tal como lo verá el estudiante…"
                        rows={3}
                      />
                    </BuilderField>

                    <BuilderField label="Respuesta modelo" required hint="La respuesta completa que se mostrará después.">
                      <textarea
                        value={selectedQuestion.modelAnswer}
                        onChange={event => updateQuestion({ modelAnswer: event.target.value })}
                        placeholder="Respuesta esperada…"
                        rows={5}
                      />
                    </BuilderField>

                    <BuilderField
                      label="También considero correcto mencionar"
                      hint="Un criterio por línea. Podés dejarlo vacío."
                    >
                      <textarea
                        value={selectedQuestion.acceptedPoints.join("\n")}
                        onChange={event => updateQuestion({
                          acceptedPoints: event.target.value
                            .split("\n")
                            .map(point => point.trim())
                            .filter(Boolean)
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
              {publishing ? "Publicando…" : "Publicar en Odontoma"}
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

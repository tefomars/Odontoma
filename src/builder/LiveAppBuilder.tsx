import { useEffect, useMemo, useState } from "react"

import HomeScreen from "@/components/HomeScreen"

import type {
  HomeContent,
  HomeSubject,
  SubjectDestination
} from "@/content/appBuilder"

const HOME_DRAFT_KEY = "odontoma-home-builder-draft-v1"

const destinationOptions: Array<{
  value: SubjectDestination
  label: string
  description: string
}> = [
  {
    value: "coming-soon",
    label: "Próximamente",
    description: "La tarjeta se muestra desactivada."
  },
  {
    value: "open-quizzes",
    label: "Preguntas abiertas",
    description: "Abre los apartados de respuesta libre."
  },
  {
    value: "histologia",
    label: "Histología existente",
    description: "Abre los capítulos actuales de Histología."
  },
  {
    value: "filosofia-de-hayek",
    label: "Filosofía existente",
    description: "Abre los capítulos actuales de Hayek."
  }
]

function createId() {
  return `subject-${Date.now()}-${crypto.randomUUID()}`
}

function readDraft() {
  try {
    const raw = localStorage.getItem(HOME_DRAFT_KEY)
    return raw ? JSON.parse(raw) as HomeContent : null
  } catch {
    return null
  }
}

export default function LiveAppBuilder() {
  const [content, setContent] = useState<HomeContent>({ subjects: [] })
  const [appliedContent, setAppliedContent] = useState<HomeContent>({ subjects: [] })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState("Cargando la pantalla real…")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/__odontoma-builder/home-content")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<HomeContent>
      })
      .then(value => {
        const draft = readDraft()
        const initial = draft || value

        setAppliedContent(value)
        setContent(initial)
        setStatus(
          draft
            ? "Se recuperó tu borrador local."
            : "Estás editando la pantalla actual de Odontoma."
        )
        setLoaded(true)
      })
      .catch(() => {
        setStatus("No se pudo cargar el contenido editable.")
        setLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(HOME_DRAFT_KEY, JSON.stringify(content))
  }, [content, loaded])

  const selectedSubject = content.subjects.find(subject => subject.id === selectedId)
  const selectedIndex = content.subjects.findIndex(subject => subject.id === selectedId)

  const hasInvalidContent = useMemo(
    () => content.subjects.some(subject =>
      !subject.title.trim() ||
      !subject.status.trim() ||
      !/^#[0-9a-f]{6}$/i.test(subject.accentColor)
    ),
    [content]
  )

  function addSubject() {
    const subject: HomeSubject = {
      id: createId(),
      title: "Nueva materia",
      subtitle: "Agregá una descripción breve.",
      status: "Próximamente",
      accentColor: "#0d9488",
      destination: "coming-soon"
    }

    setContent(current => ({
      subjects: [...current.subjects, subject]
    }))
    setSelectedId(subject.id)
    setStatus("Materia agregada al borrador. Editala en el panel derecho.")
  }

  function updateSubject(changes: Partial<HomeSubject>) {
    if (!selectedId) return

    setContent(current => ({
      subjects: current.subjects.map(subject =>
        subject.id === selectedId
          ? { ...subject, ...changes }
          : subject
      )
    }))
  }

  function moveSubject(direction: -1 | 1) {
    if (selectedIndex < 0) return

    const targetIndex = selectedIndex + direction
    if (targetIndex < 0 || targetIndex >= content.subjects.length) return

    const next = [...content.subjects]
    ;[next[selectedIndex], next[targetIndex]] = [next[targetIndex], next[selectedIndex]]
    setContent({ subjects: next })
  }

  function deleteSubject() {
    if (!selectedSubject) return

    const confirmed = window.confirm(
      `¿Quitar "${selectedSubject.title}" de la pantalla de materias? El contenido interno no se borra.`
    )

    if (!confirmed) return

    setContent(current => ({
      subjects: current.subjects.filter(subject => subject.id !== selectedSubject.id)
    }))
    setSelectedId(null)
    setStatus("Tarjeta eliminada del borrador. Aplicá para confirmar.")
  }

  async function applyContent() {
    if (hasInvalidContent) return

    setSaving(true)
    setStatus("Aplicando cambios…")

    try {
      const response = await fetch("/__odontoma-builder/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      })

      if (!response.ok) throw new Error(await response.text())

      setAppliedContent(content)
      localStorage.removeItem(HOME_DRAFT_KEY)
      setStatus("Cambios aplicados. Odontoma se actualizará automáticamente.")
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `No se pudo aplicar: ${error.message}`
          : "No se pudieron aplicar los cambios."
      )
    } finally {
      setSaving(false)
    }
  }

  function discardDraft() {
    setContent(appliedContent)
    setSelectedId(null)
    localStorage.removeItem(HOME_DRAFT_KEY)
    setStatus("Borrador descartado. Volviste a la versión aplicada.")
  }

  return (
    <section className="live-app-builder">
      <div className="live-app-stage">
        <div className="live-app-stage-bar">
          <div>
            <span className="live-indicator" />
            <strong>Vista editable real</strong>
            <small>Los controles verdes solo existen en tu máquina.</small>
          </div>
          <button className="stage-add-button" onClick={addSubject}>
            + Agregar materia
          </button>
        </div>

        <div className="live-app-preview">
          <HomeScreen
            subjects={content.subjects}
            editorMode
            onSelectSubject={() => undefined}
            onSelectMyQuizzes={() => undefined}
            onSelectOpenQuizzes={() => undefined}
            onAddSubject={addSubject}
            onEditSubject={subject => setSelectedId(subject.id)}
          />
        </div>
      </div>

      <aside className={`live-inspector ${selectedSubject ? "open" : ""}`}>
        {selectedSubject ? (
          <>
            <header className="inspector-header">
              <div>
                <p className="eyebrow">EDITANDO TARJETA</p>
                <h2>{selectedSubject.title || "Sin título"}</h2>
              </div>
              <button
                className="inspector-close"
                onClick={() => setSelectedId(null)}
                aria-label="Cerrar editor"
              >
                ×
              </button>
            </header>

            <div className="inspector-fields">
              <InspectorField label="Título">
                <input
                  value={selectedSubject.title}
                  onChange={event => updateSubject({ title: event.target.value })}
                />
              </InspectorField>

              <InspectorField label="Descripción">
                <textarea
                  rows={4}
                  value={selectedSubject.subtitle}
                  onChange={event => updateSubject({ subtitle: event.target.value })}
                />
              </InspectorField>

              <InspectorField label="Texto del estado">
                <input
                  value={selectedSubject.status}
                  onChange={event => updateSubject({ status: event.target.value })}
                />
              </InspectorField>

              <InspectorField label="Color">
                <span className="inspector-color-row">
                  <input
                    type="color"
                    value={selectedSubject.accentColor}
                    onChange={event => updateSubject({ accentColor: event.target.value })}
                  />
                  <code>{selectedSubject.accentColor.toUpperCase()}</code>
                </span>
              </InspectorField>

              <InspectorField
                label="¿Qué abre esta tarjeta?"
                hint="Podés dejarla como próximamente hasta crear su contenido."
              >
                <select
                  value={selectedSubject.destination}
                  onChange={event => updateSubject({
                    destination: event.target.value as SubjectDestination,
                    status: event.target.value === "coming-soon"
                      ? "Próximamente"
                      : "Disponible"
                  })}
                >
                  {destinationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small className="destination-help">
                  {destinationOptions.find(
                    option => option.value === selectedSubject.destination
                  )?.description}
                </small>
              </InspectorField>

              <div className="order-controls">
                <button
                  onClick={() => moveSubject(-1)}
                  disabled={selectedIndex <= 0}
                >
                  ← Mover antes
                </button>
                <button
                  onClick={() => moveSubject(1)}
                  disabled={selectedIndex === content.subjects.length - 1}
                >
                  Mover después →
                </button>
              </div>

              <button className="inspector-delete" onClick={deleteSubject}>
                Quitar tarjeta de la pantalla
              </button>
            </div>
          </>
        ) : (
          <div className="inspector-empty">
            <span>✎</span>
            <h2>Seleccioná algo para editar</h2>
            <p>
              Pulsá <strong>Editar</strong> sobre una tarjeta o el signo + para
              crear una materia nueva.
            </p>
          </div>
        )}

        <footer className="inspector-actions">
          <div className="inspector-status">
            <span className="status-dot active" />
            <p>{status}</p>
          </div>
          {hasInvalidContent && (
            <p className="validation-message">
              Todas las tarjetas necesitan título, estado y un color válido.
            </p>
          )}
          <div className="actions">
            <button
              className="builder-button secondary"
              onClick={discardDraft}
              disabled={saving}
            >
              Descartar
            </button>
            <button
              className="builder-button apply"
              onClick={applyContent}
              disabled={saving || hasInvalidContent}
            >
              {saving ? "Aplicando…" : "Aplicar a Odontoma"}
            </button>
          </div>
        </footer>
      </aside>
    </section>
  )
}

function InspectorField({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="inspector-field">
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  )
}

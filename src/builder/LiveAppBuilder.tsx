import { useEffect, useMemo, useState, type ReactNode } from "react"

import HomeScreen from "@/components/HomeScreen"
import QuizModeScreen from "@/components/QuizModeScreen"
import StudyMethodScreen from "@/components/StudyMethodScreen"

import {
  homeContent,
  type AppMenuCard,
  type HomeContent,
  type HomeSubject,
  type SubjectDestination
} from "@/content/appBuilder"

const HOME_DRAFT_KEY = "odontoma-home-builder-draft-v2"

type BuilderView = "main-menu" | "quiz-menu" | "subjects"
type Selection =
  | { kind: "main-header" }
  | { kind: "quiz-header" }
  | { kind: "main-card"; id: string }
  | { kind: "quiz-card"; id: string }
  | { kind: "subject"; id: string }

const destinationOptions: Array<{
  value: SubjectDestination
  label: string
  description: string
}> = [
  { value: "coming-soon", label: "Próximamente", description: "La tarjeta se muestra desactivada." },
  { value: "open-quizzes", label: "Preguntas abiertas", description: "Abre los apartados de respuesta libre." },
  { value: "histologia", label: "Histología existente", description: "Abre los capítulos actuales de Histología." },
  { value: "filosofia-de-hayek", label: "Filosofía existente", description: "Abre los capítulos actuales de Hayek." }
]

function createId() {
  return `subject-${Date.now()}-${crypto.randomUUID()}`
}

function normalizeContent(value: Partial<HomeContent> | null): HomeContent {
  return {
    mainMenu: value?.mainMenu || homeContent.mainMenu,
    quizMenu: value?.quizMenu || homeContent.quizMenu,
    subjects: value?.subjects || homeContent.subjects
  }
}

function readDraft() {
  try {
    const raw = localStorage.getItem(HOME_DRAFT_KEY)
    return raw ? normalizeContent(JSON.parse(raw) as Partial<HomeContent>) : null
  } catch {
    return null
  }
}

export default function LiveAppBuilder() {
  const [content, setContent] = useState<HomeContent>(homeContent)
  const [appliedContent, setAppliedContent] = useState<HomeContent>(homeContent)
  const [view, setView] = useState<BuilderView>("main-menu")
  const [selection, setSelection] = useState<Selection | null>(null)
  const [status, setStatus] = useState("Cargando las pantallas reales…")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/__odontoma-builder/home-content")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<Partial<HomeContent>>
      })
      .then(value => {
        const applied = normalizeContent(value)
        const draft = readDraft()
        setAppliedContent(applied)
        setContent(draft || applied)
        setStatus(draft ? "Se recuperó tu borrador local." : "Estás editando las pantallas actuales de Odontoma.")
        setLoaded(true)
      })
      .catch(() => {
        setStatus("No se pudo cargar el contenido editable.")
        setLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(HOME_DRAFT_KEY, JSON.stringify(content))
  }, [content, loaded])

  const selectedSubject = selection?.kind === "subject"
    ? content.subjects.find(subject => subject.id === selection.id)
    : undefined
  const selectedIndex = selectedSubject
    ? content.subjects.findIndex(subject => subject.id === selectedSubject.id)
    : -1
  const selectedCard = selection?.kind === "main-card"
    ? content.mainMenu.cards.find(card => card.id === selection.id)
    : selection?.kind === "quiz-card"
      ? content.quizMenu.cards.find(card => card.id === selection.id)
      : undefined

  const hasInvalidContent = useMemo(() => {
    const cards = [...content.mainMenu.cards, ...content.quizMenu.cards]
    return !content.mainMenu.eyebrow.trim() ||
      !content.mainMenu.title.trim() ||
      !content.quizMenu.eyebrow.trim() ||
      !content.quizMenu.title.trim() ||
      !content.quizMenu.subtitle.trim() ||
      !content.quizMenu.toolsLabel.trim() ||
      cards.some(card =>
        !card.eyebrow.trim() ||
        !card.title.trim() ||
        !card.subtitle.trim() ||
        !card.symbol.trim() ||
        !/^#[0-9a-f]{6}$/i.test(card.accentColor)
      ) ||
      content.subjects.some(subject =>
        !subject.title.trim() ||
        !subject.status.trim() ||
        !/^#[0-9a-f]{6}$/i.test(subject.accentColor)
      )
  }, [content])

  function chooseView(nextView: BuilderView) {
    setView(nextView)
    setSelection(null)
  }

  function addSubject() {
    const subject: HomeSubject = {
      id: createId(),
      title: "Nueva materia",
      subtitle: "Agregá una descripción breve.",
      status: "Próximamente",
      accentColor: "#0d9488",
      destination: "coming-soon"
    }
    setContent(current => ({ ...current, subjects: [...current.subjects, subject] }))
    setSelection({ kind: "subject", id: subject.id })
    setStatus("Materia agregada al borrador. Editala en el panel derecho.")
  }

  function updateSubject(changes: Partial<HomeSubject>) {
    if (!selectedSubject) return
    setContent(current => ({
      ...current,
      subjects: current.subjects.map(subject =>
        subject.id === selectedSubject.id ? { ...subject, ...changes } : subject
      )
    }))
  }

  function updateCard(changes: Partial<AppMenuCard>) {
    if (!selection || !selectedCard) return
    const menu = selection.kind === "main-card" ? "mainMenu" : "quizMenu"
    setContent(current => ({
      ...current,
      [menu]: {
        ...current[menu],
        cards: current[menu].cards.map(card =>
          card.id === selectedCard.id ? { ...card, ...changes } : card
        )
      }
    }))
  }

  function moveSubject(direction: -1 | 1) {
    if (selectedIndex < 0) return
    const targetIndex = selectedIndex + direction
    if (targetIndex < 0 || targetIndex >= content.subjects.length) return
    const next = [...content.subjects]
    ;[next[selectedIndex], next[targetIndex]] = [next[targetIndex], next[selectedIndex]]
    setContent(current => ({ ...current, subjects: next }))
  }

  function deleteSubject() {
    if (!selectedSubject) return
    setContent(current => ({
      ...current,
      subjects: current.subjects.filter(subject => subject.id !== selectedSubject.id)
    }))
    setSelection(null)
    setStatus(`“${selectedSubject.title}” se quitó del borrador. Aplicá para guardar o descartá para recuperarla.`)
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
      setStatus(error instanceof Error ? `No se pudo aplicar: ${error.message}` : "No se pudieron aplicar los cambios.")
    } finally {
      setSaving(false)
    }
  }

  function discardDraft() {
    setContent(appliedContent)
    setSelection(null)
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
            <small>Elegí una pantalla y pulsá sus lápices verdes.</small>
          </div>
          {view === "subjects" && (
            <button className="stage-add-button" onClick={addSubject}>+ Agregar materia</button>
          )}
        </div>

        <nav className="live-screen-switcher" aria-label="Pantalla para editar">
          <button className={view === "main-menu" ? "active" : ""} onClick={() => chooseView("main-menu")}>Menú principal</button>
          <button className={view === "quiz-menu" ? "active" : ""} onClick={() => chooseView("quiz-menu")}>Tipos de quiz</button>
          <button className={view === "subjects" ? "active" : ""} onClick={() => chooseView("subjects")}>Materias</button>
        </nav>

        <div className="live-app-preview">
          {view === "main-menu" ? (
            <StudyMethodScreen
              content={content.mainMenu}
              editorMode
              onSelectQuizzes={() => undefined}
              onSelectFlashcards={() => undefined}
              onEditHeader={() => setSelection({ kind: "main-header" })}
              onEditCard={card => setSelection({ kind: "main-card", id: card.id })}
            />
          ) : view === "quiz-menu" ? (
            <QuizModeScreen
              content={content.quizMenu}
              editorMode
              onBack={() => undefined}
              onMainMenu={() => undefined}
              onSelectMultipleChoice={() => undefined}
              onSelectOpenEnded={() => undefined}
              onSelectMyQuizzes={() => undefined}
              onEditHeader={() => setSelection({ kind: "quiz-header" })}
              onEditCard={card => setSelection({ kind: "quiz-card", id: card.id })}
            />
          ) : (
            <HomeScreen
              subjects={content.subjects}
              editorMode
              onSelectSubject={() => undefined}
              onAddSubject={addSubject}
              onEditSubject={subject => setSelection({ kind: "subject", id: subject.id })}
            />
          )}
        </div>
      </div>

      <aside className={`live-inspector ${selection ? "open" : ""}`}>
        {selection ? (
          <>
            <header className="inspector-header">
              <div>
                <p className="eyebrow">EDITANDO</p>
                <h2>{inspectorTitle(selection, selectedCard, selectedSubject)}</h2>
              </div>
              <button className="inspector-close" onClick={() => setSelection(null)} aria-label="Cerrar editor">×</button>
            </header>
            <div className="inspector-fields">
              {selection.kind === "main-header" && (
                <>
                  <TextField label="Texto pequeño" value={content.mainMenu.eyebrow} onChange={eyebrow => setContent(current => ({ ...current, mainMenu: { ...current.mainMenu, eyebrow } }))} />
                  <TextField label="Título" value={content.mainMenu.title} onChange={title => setContent(current => ({ ...current, mainMenu: { ...current.mainMenu, title } }))} />
                </>
              )}
              {selection.kind === "quiz-header" && (
                <>
                  <TextField label="Texto pequeño" value={content.quizMenu.eyebrow} onChange={eyebrow => setContent(current => ({ ...current, quizMenu: { ...current.quizMenu, eyebrow } }))} />
                  <TextField label="Título" value={content.quizMenu.title} onChange={title => setContent(current => ({ ...current, quizMenu: { ...current.quizMenu, title } }))} />
                  <TextField label="Descripción" value={content.quizMenu.subtitle} multiline onChange={subtitle => setContent(current => ({ ...current, quizMenu: { ...current.quizMenu, subtitle } }))} />
                  <TextField label="Título sobre My quizzes" value={content.quizMenu.toolsLabel} onChange={toolsLabel => setContent(current => ({ ...current, quizMenu: { ...current.quizMenu, toolsLabel } }))} />
                </>
              )}
              {selectedCard && (
                <>
                  <TextField label="Etiqueta" value={selectedCard.eyebrow} onChange={eyebrow => updateCard({ eyebrow })} />
                  <TextField label="Título" value={selectedCard.title} onChange={title => updateCard({ title })} />
                  <TextField label="Descripción" value={selectedCard.subtitle} multiline onChange={subtitle => updateCard({ subtitle })} />
                  <TextField label="Símbolo" hint="Puede ser una letra, signo o texto corto." value={selectedCard.symbol} onChange={symbol => updateCard({ symbol })} />
                  <ColorField value={selectedCard.accentColor} onChange={accentColor => updateCard({ accentColor })} />
                  <p className="destination-help">La acción de esta tarjeta está protegida para no romper su navegación.</p>
                </>
              )}
              {selectedSubject && (
                <SubjectFields
                  subject={selectedSubject}
                  selectedIndex={selectedIndex}
                  total={content.subjects.length}
                  onChange={updateSubject}
                  onMove={moveSubject}
                  onDelete={deleteSubject}
                />
              )}
            </div>
          </>
        ) : (
          <div className="inspector-empty">
            <span>✎</span>
            <h2>Seleccioná algo para editar</h2>
            <p>Elegí una pantalla arriba y pulsá <strong>Editar</strong> sobre su encabezado o una tarjeta.</p>
          </div>
        )}

        <footer className="inspector-actions">
          <div className="inspector-status"><span className="status-dot active" /><p>{status}</p></div>
          {hasInvalidContent && <p className="validation-message">Los títulos, etiquetas, símbolos y colores deben ser válidos.</p>}
          <div className="actions">
            <button className="builder-button secondary" onClick={discardDraft} disabled={saving}>Descartar</button>
            <button className="builder-button apply" onClick={applyContent} disabled={saving || hasInvalidContent}>{saving ? "Aplicando…" : "Aplicar a Odontoma"}</button>
          </div>
        </footer>
      </aside>
    </section>
  )
}

function inspectorTitle(selection: Selection, card?: AppMenuCard, subject?: HomeSubject) {
  if (selection.kind === "main-header") return "Encabezado principal"
  if (selection.kind === "quiz-header") return "Encabezado de quizzes"
  return card?.title || subject?.title || "Elemento"
}

function TextField({ label, hint, value, multiline = false, onChange }: { label: string; hint?: string; value: string; multiline?: boolean; onChange: (value: string) => void }) {
  return (
    <InspectorField label={label} hint={hint}>
      {multiline
        ? <textarea rows={4} value={value} onChange={event => onChange(event.target.value)} />
        : <input value={value} onChange={event => onChange(event.target.value)} />}
    </InspectorField>
  )
}

function ColorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <InspectorField label="Color">
      <span className="inspector-color-row">
        <input type="color" value={value} onChange={event => onChange(event.target.value)} />
        <code>{value.toUpperCase()}</code>
      </span>
    </InspectorField>
  )
}

function SubjectFields({ subject, selectedIndex, total, onChange, onMove, onDelete }: { subject: HomeSubject; selectedIndex: number; total: number; onChange: (changes: Partial<HomeSubject>) => void; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  return (
    <>
      <TextField label="Título" value={subject.title} onChange={title => onChange({ title })} />
      <TextField label="Descripción" value={subject.subtitle} multiline onChange={subtitle => onChange({ subtitle })} />
      <TextField label="Texto del estado" value={subject.status} onChange={status => onChange({ status })} />
      <ColorField value={subject.accentColor} onChange={accentColor => onChange({ accentColor })} />
      <InspectorField label="¿Qué abre esta tarjeta?" hint="Podés dejarla como próximamente hasta crear su contenido.">
        <select value={subject.destination} onChange={event => onChange({ destination: event.target.value as SubjectDestination, status: event.target.value === "coming-soon" ? "Próximamente" : "Disponible" })}>
          {destinationOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <small className="destination-help">{destinationOptions.find(option => option.value === subject.destination)?.description}</small>
      </InspectorField>
      <div className="order-controls">
        <button onClick={() => onMove(-1)} disabled={selectedIndex <= 0}>← Mover antes</button>
        <button onClick={() => onMove(1)} disabled={selectedIndex === total - 1}>Mover después →</button>
      </div>
      <button className="inspector-delete" onClick={onDelete}>Quitar tarjeta de la pantalla</button>
    </>
  )
}

function InspectorField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="inspector-field">
      <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  )
}

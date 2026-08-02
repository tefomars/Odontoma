import { useEffect, useMemo, useState, type ReactNode } from "react"

import HomeScreen from "@/components/HomeScreen"
import QuizModeScreen from "@/components/QuizModeScreen"
import StudyMethodScreen from "@/components/StudyMethodScreen"
import FlashcardSubjectScreen from "@/components/flashcards/FlashcardSubjectScreen"
import { flashcardSubjectBlocks } from "@/content/appBuilder/flashcardSubjects"
import { customPages } from "@/content/appBuilder/customPages"

import {
  homeContent,
  type AppMenuCard,
  type AppMenuDestination,
  type FlashcardSubjectBlock,
  type FlashcardSubjectDestination,
  type HomeContent,
  type HomeSubject,
  type SubjectDestination
} from "@/content/appBuilder"

import { saveBuilderSnapshot } from "./builderSnapshots"
import { useHistoryState } from "./useHistoryState"

const HOME_DRAFT_KEY = "odontoma-home-builder-draft-v2"
const FLASHCARD_SUBJECTS_DRAFT_KEY = "odontoma-flashcard-subjects-builder-draft-v1"

type BuilderView = "main-menu" | "quiz-menu" | "subjects" | "flashcard-subjects"
type PreviewDevice = "desktop" | "tablet" | "phone"
type Selection =
  | { kind: "main-header" }
  | { kind: "quiz-header" }
  | { kind: "main-card"; id: string }
  | { kind: "quiz-card"; id: string }
  | { kind: "subject"; id: string }
  | { kind: "flashcard-subject"; id: string }

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

const mainMenuDestinationOptions: Array<{ value: AppMenuDestination; label: string }> = [
  { value: "quizzes", label: "Abrir Quizzes" },
  { value: "flashcards", label: "Abrir Flashcards" },
  { value: "coming-soon", label: "Sin acción por ahora" }
]

const quizDestinationOptions: Array<{ value: AppMenuDestination; label: string }> = [
  { value: "multiple-choice", label: "Opción múltiple" },
  { value: "open-ended", label: "Respuestas abiertas" },
  { value: "my-quizzes", label: "My quizzes" },
  { value: "coming-soon", label: "Sin acción por ahora" }
]

const flashcardDestinationOptions: Array<{ value: FlashcardSubjectDestination; label: string }> = [
  { value: "coming-soon", label: "Sin contenido por ahora" },
  { value: "histologia", label: "Decks de Histología" },
  { value: "proceso-economico-i", label: "Decks de Proceso Económico I" },
  { value: "filosofia-de-hayek", label: "Decks de Filosofía" }
]

const customDestinationOptionsForSubjects: Array<{
  value: SubjectDestination
  label: string
  description: string
}> = customPages.map(page => ({
  value: `custom-page:${page.id}`,
  label: `Pantalla: ${page.title}`,
  description: "Abre una pantalla creada en el constructor."
}))

function createId() {
  return `subject-${Date.now()}-${crypto.randomUUID()}`
}

function createBlockId(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}`
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

function readFlashcardSubjectsDraft() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FLASHCARD_SUBJECTS_DRAFT_KEY) || "null")
    return Array.isArray(parsed) ? parsed as FlashcardSubjectBlock[] : null
  } catch {
    return null
  }
}

export default function LiveAppBuilder() {
  const contentHistory = useHistoryState<HomeContent>(homeContent)
  const content = contentHistory.state
  const setContent = contentHistory.setState
  const [appliedContent, setAppliedContent] = useState<HomeContent>(homeContent)
  const [view, setView] = useState<BuilderView>("main-menu")
  const [selection, setSelection] = useState<Selection | null>(null)
  const [status, setStatus] = useState("Cargando las pantallas reales…")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const flashcardHistory = useHistoryState<FlashcardSubjectBlock[]>(flashcardSubjectBlocks)
  const flashcardSubjects = flashcardHistory.state
  const setFlashcardSubjects = flashcardHistory.setState
  const [appliedFlashcardSubjects, setAppliedFlashcardSubjects] = useState<FlashcardSubjectBlock[]>(flashcardSubjectBlocks)
  const [flashcardSubjectsLoaded, setFlashcardSubjectsLoaded] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop")

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
        contentHistory.reset(draft || applied)
        setStatus(draft ? "Se recuperó tu borrador local." : "Estás editando las pantallas actuales de Odontoma.")
        setLoaded(true)
      })
      .catch(() => {
        setStatus("No se pudo cargar el contenido editable.")
        setLoaded(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch("/__odontoma-builder/flashcard-subjects")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<FlashcardSubjectBlock[]>
      })
      .then(value => {
        const draft = readFlashcardSubjectsDraft()
        setAppliedFlashcardSubjects(value)
        flashcardHistory.reset(draft || value)
        setFlashcardSubjectsLoaded(true)
      })
      .catch(() => {
        setStatus("No se pudieron cargar los bloques de Flashcards.")
        setFlashcardSubjectsLoaded(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded) return
    if (JSON.stringify(content) === JSON.stringify(appliedContent)) localStorage.removeItem(HOME_DRAFT_KEY)
    else localStorage.setItem(HOME_DRAFT_KEY, JSON.stringify(content))
  }, [appliedContent, content, loaded])

  useEffect(() => {
    if (!flashcardSubjectsLoaded) return
    if (JSON.stringify(flashcardSubjects) === JSON.stringify(appliedFlashcardSubjects)) {
      localStorage.removeItem(FLASHCARD_SUBJECTS_DRAFT_KEY)
    } else {
      localStorage.setItem(FLASHCARD_SUBJECTS_DRAFT_KEY, JSON.stringify(flashcardSubjects))
    }
  }, [appliedFlashcardSubjects, flashcardSubjects, flashcardSubjectsLoaded])

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
  const selectedFlashcardSubject = selection?.kind === "flashcard-subject"
    ? flashcardSubjects.find(subject => subject.id === selection.id)
    : undefined
  const selectedFlashcardSubjectIndex = selectedFlashcardSubject
    ? flashcardSubjects.findIndex(subject => subject.id === selectedFlashcardSubject.id)
    : -1
  const selectedCardIndex = selectedCard && selection
    ? (selection.kind === "main-card" ? content.mainMenu.cards : content.quizMenu.cards)
      .findIndex(card => card.id === selectedCard.id)
    : -1

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
      ) ||
      flashcardSubjects.some(subject =>
        !subject.title.trim() ||
        !subject.subtitle.trim() ||
        !subject.description.trim() ||
        !/^#[0-9a-f]{6}$/i.test(subject.accentColor)
      )
  }, [content, flashcardSubjects])

  const customDestinationOptions = customPages.map(page => ({
    value: `custom-page:${page.id}` as AppMenuDestination,
    label: `Pantalla: ${page.title}`
  }))
  const activeHistory = view === "flashcard-subjects" ? flashcardHistory : contentHistory
  const pendingChanges = useMemo(() => {
    const changes: string[] = []
    if (JSON.stringify(content.mainMenu) !== JSON.stringify(appliedContent.mainMenu)) changes.push("Menú principal modificado")
    if (JSON.stringify(content.quizMenu) !== JSON.stringify(appliedContent.quizMenu)) changes.push("Menú de quizzes modificado")
    if (JSON.stringify(content.subjects) !== JSON.stringify(appliedContent.subjects)) changes.push("Materias modificadas")
    if (JSON.stringify(flashcardSubjects) !== JSON.stringify(appliedFlashcardSubjects)) changes.push("Decks de Flashcards modificados")
    return changes
  }, [appliedContent, appliedFlashcardSubjects, content, flashcardSubjects])

  function chooseView(nextView: BuilderView) {
    setView(nextView)
    setSelection(null)
  }

  function addMenuCard(menu: "mainMenu" | "quizMenu") {
    const card: AppMenuCard = {
      id: createBlockId(menu === "mainMenu" ? "main-block" : "quiz-block"),
      eyebrow: "Nuevo bloque",
      title: "Nuevo botón",
      subtitle: "Agregá una descripción breve.",
      symbol: "+",
      accentColor: menu === "mainMenu" ? "#10b981" : "#8b5cf6",
      destination: "coming-soon",
      ...(menu === "quizMenu" ? { section: "main" as const } : {})
    }
    setContent(current => ({
      ...current,
      [menu]: { ...current[menu], cards: [...current[menu].cards, card] }
    }))
    setSelection({ kind: menu === "mainMenu" ? "main-card" : "quiz-card", id: card.id })
    setStatus("Bloque agregado. Elegí su texto, color y qué pantalla abre.")
  }

  function deleteSelectedCard() {
    if (!selectedCard || !selection || (selection.kind !== "main-card" && selection.kind !== "quiz-card")) return
    const menu = selection.kind === "main-card" ? "mainMenu" : "quizMenu"
    setContent(current => ({
      ...current,
      [menu]: { ...current[menu], cards: current[menu].cards.filter(card => card.id !== selectedCard.id) }
    }))
    setSelection(null)
    setStatus(`“${selectedCard.title}” se quitó del borrador.`)
  }

  function duplicateSelectedCard() {
    if (!selectedCard || !selection || (selection.kind !== "main-card" && selection.kind !== "quiz-card")) return
    const menu = selection.kind === "main-card" ? "mainMenu" : "quizMenu"
    const duplicate: AppMenuCard = { ...selectedCard, id: createBlockId("menu-block"), title: `${selectedCard.title} copia` }
    const cards = [...content[menu].cards]
    cards.splice(selectedCardIndex + 1, 0, duplicate)
    setContent(current => ({ ...current, [menu]: { ...current[menu], cards } }))
    setSelection({ kind: selection.kind, id: duplicate.id })
    setStatus("Bloque duplicado con la misma acción. Podés cambiar su destino.")
  }

  function moveSelectedCard(direction: -1 | 1) {
    if (!selectedCard || !selection || selectedCardIndex < 0 || (selection.kind !== "main-card" && selection.kind !== "quiz-card")) return
    const menu = selection.kind === "main-card" ? "mainMenu" : "quizMenu"
    const cards = [...content[menu].cards]
    const target = selectedCardIndex + direction
    if (target < 0 || target >= cards.length) return
    ;[cards[selectedCardIndex], cards[target]] = [cards[target], cards[selectedCardIndex]]
    setContent(current => ({ ...current, [menu]: { ...current[menu], cards } }))
  }

  function reorderMenuCard(menu: "mainMenu" | "quizMenu", sourceId: string, targetId: string) {
    if (sourceId === targetId) return
    setContent(current => {
      const cards = [...current[menu].cards]
      const sourceIndex = cards.findIndex(card => card.id === sourceId)
      const targetIndex = cards.findIndex(card => card.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return current
      const [moved] = cards.splice(sourceIndex, 1)
      cards.splice(targetIndex, 0, moved)
      return { ...current, [menu]: { ...current[menu], cards } }
    })
    setStatus("Orden actualizado en el borrador.")
  }

  function addFlashcardSubject() {
    const subject: FlashcardSubjectBlock = {
      id: createBlockId("flashcard-block"),
      title: "Nuevo deck",
      subtitle: "Próximamente",
      description: "Agregá una descripción breve.",
      accent: "from-emerald-500/20 to-teal-500/10",
      accentColor: "#10b981",
      destination: "coming-soon"
    }
    setFlashcardSubjects(current => [...current, subject])
    setSelection({ kind: "flashcard-subject", id: subject.id })
    setStatus("Bloque de Flashcards agregado. Configuralo en el panel derecho.")
  }

  function updateFlashcardSubject(changes: Partial<FlashcardSubjectBlock>) {
    if (!selectedFlashcardSubject) return
    setFlashcardSubjects(current => current.map(subject =>
      subject.id === selectedFlashcardSubject.id ? { ...subject, ...changes } : subject
    ))
  }

  function moveFlashcardSubject(direction: -1 | 1) {
    if (selectedFlashcardSubjectIndex < 0) return
    const target = selectedFlashcardSubjectIndex + direction
    if (target < 0 || target >= flashcardSubjects.length) return
    const next = [...flashcardSubjects]
    ;[next[selectedFlashcardSubjectIndex], next[target]] = [next[target], next[selectedFlashcardSubjectIndex]]
    setFlashcardSubjects(next)
  }

  function reorderFlashcardSubject(sourceId: string, targetId: string) {
    if (sourceId === targetId) return
    setFlashcardSubjects(current => {
      const next = [...current]
      const sourceIndex = next.findIndex(subject => subject.id === sourceId)
      const targetIndex = next.findIndex(subject => subject.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return current
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setStatus("Orden actualizado en el borrador.")
  }

  function deleteFlashcardSubject() {
    if (!selectedFlashcardSubject) return
    setFlashcardSubjects(current => current.filter(subject => subject.id !== selectedFlashcardSubject.id))
    setSelection(null)
    setStatus(`“${selectedFlashcardSubject.title}” se quitó del borrador.`)
  }

  function duplicateFlashcardSubject() {
    if (!selectedFlashcardSubject) return
    const duplicate: FlashcardSubjectBlock = { ...selectedFlashcardSubject, id: createBlockId("flashcard-block"), title: `${selectedFlashcardSubject.title} copia` }
    const next = [...flashcardSubjects]
    next.splice(selectedFlashcardSubjectIndex + 1, 0, duplicate)
    setFlashcardSubjects(next)
    setSelection({ kind: "flashcard-subject", id: duplicate.id })
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

  function reorderSubject(sourceId: string, targetId: string) {
    if (sourceId === targetId) return
    setContent(current => {
      const subjects = [...current.subjects]
      const sourceIndex = subjects.findIndex(subject => subject.id === sourceId)
      const targetIndex = subjects.findIndex(subject => subject.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return current
      const [moved] = subjects.splice(sourceIndex, 1)
      subjects.splice(targetIndex, 0, moved)
      return { ...current, subjects }
    })
    setStatus("Orden actualizado en el borrador.")
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

  function duplicateSubject() {
    if (!selectedSubject) return
    const duplicate: HomeSubject = { ...selectedSubject, id: createId(), title: `${selectedSubject.title} copia` }
    const next = [...content.subjects]
    next.splice(selectedIndex + 1, 0, duplicate)
    setContent(current => ({ ...current, subjects: next }))
    setSelection({ kind: "subject", id: duplicate.id })
  }

  async function applyContent() {
    if (hasInvalidContent) return
    setSaving(true)
    setStatus("Aplicando cambios…")
    try {
      saveBuilderSnapshot("structure", { content: appliedContent, flashcardSubjects: appliedFlashcardSubjects })
      const [homeResponse, flashcardResponse] = await Promise.all([
        fetch("/__odontoma-builder/home-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content)
        }),
        fetch("/__odontoma-builder/flashcard-subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flashcardSubjects)
        })
      ])
      if (!homeResponse.ok) throw new Error(await homeResponse.text())
      if (!flashcardResponse.ok) throw new Error(await flashcardResponse.text())
      setAppliedContent(content)
      setAppliedFlashcardSubjects(flashcardSubjects)
      localStorage.removeItem(HOME_DRAFT_KEY)
      localStorage.removeItem(FLASHCARD_SUBJECTS_DRAFT_KEY)
      setStatus("Cambios aplicados. Odontoma se actualizará automáticamente.")
    } catch (error) {
      setStatus(error instanceof Error ? `No se pudo aplicar: ${error.message}` : "No se pudieron aplicar los cambios.")
    } finally {
      setSaving(false)
    }
  }

  function discardDraft() {
    contentHistory.reset(appliedContent)
    flashcardHistory.reset(appliedFlashcardSubjects)
    setSelection(null)
    localStorage.removeItem(HOME_DRAFT_KEY)
    localStorage.removeItem(FLASHCARD_SUBJECTS_DRAFT_KEY)
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
          {view === "subjects" && <button className="stage-add-button" onClick={addSubject}>+ Agregar materia</button>}
          {view === "main-menu" && <button className="stage-add-button" onClick={() => addMenuCard("mainMenu")}>+ Agregar botón</button>}
          {view === "quiz-menu" && <button className="stage-add-button" onClick={() => addMenuCard("quizMenu")}>+ Agregar botón</button>}
          {view === "flashcard-subjects" && <button className="stage-add-button" onClick={addFlashcardSubject}>+ Agregar deck</button>}
        </div>

        <div className="builder-qol-toolbar">
          <div className="history-controls">
            <button onClick={activeHistory.undo} disabled={!activeHistory.canUndo}>↶ Deshacer</button>
            <button onClick={activeHistory.redo} disabled={!activeHistory.canRedo}>↷ Rehacer</button>
          </div>
          <div className="device-switcher">
            <button className={previewDevice === "desktop" ? "active" : ""} onClick={() => setPreviewDevice("desktop")}>Computadora</button>
            <button className={previewDevice === "tablet" ? "active" : ""} onClick={() => setPreviewDevice("tablet")}>Tablet</button>
            <button className={previewDevice === "phone" ? "active" : ""} onClick={() => setPreviewDevice("phone")}>Teléfono</button>
          </div>
        </div>

        <nav className="live-screen-switcher" aria-label="Pantalla para editar">
          <button className={view === "main-menu" ? "active" : ""} onClick={() => chooseView("main-menu")}>Menú principal</button>
          <button className={view === "quiz-menu" ? "active" : ""} onClick={() => chooseView("quiz-menu")}>Tipos de quiz</button>
          <button className={view === "subjects" ? "active" : ""} onClick={() => chooseView("subjects")}>Materias</button>
          <button className={view === "flashcard-subjects" ? "active" : ""} onClick={() => chooseView("flashcard-subjects")}>Decks de Flashcards</button>
        </nav>

        <div className={`live-app-preview preview-device-${previewDevice}`}>
          {view === "main-menu" ? (
            <StudyMethodScreen
              content={content.mainMenu}
              editorMode
              onSelectQuizzes={() => undefined}
              onSelectFlashcards={() => undefined}
              onEditHeader={() => setSelection({ kind: "main-header" })}
              onEditCard={card => setSelection({ kind: "main-card", id: card.id })}
              onReorderCard={(sourceId, targetId) => reorderMenuCard("mainMenu", sourceId, targetId)}
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
              onReorderCard={(sourceId, targetId) => reorderMenuCard("quizMenu", sourceId, targetId)}
            />
          ) : view === "subjects" ? (
            <HomeScreen
              subjects={content.subjects}
              editorMode
              onSelectSubject={() => undefined}
              onAddSubject={addSubject}
              onEditSubject={subject => setSelection({ kind: "subject", id: subject.id })}
              onReorderSubject={reorderSubject}
            />
          ) : (
            <FlashcardSubjectScreen
              subjects={flashcardSubjects}
              editorMode
              onBack={() => undefined}
              onSelectSubject={() => undefined}
              onSelectMyDecks={() => undefined}
              onAddSubject={addFlashcardSubject}
              onEditSubject={subject => setSelection({ kind: "flashcard-subject", id: subject.id })}
              onReorderSubject={reorderFlashcardSubject}
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
                <h2>{inspectorTitle(selection, selectedCard, selectedSubject, selectedFlashcardSubject)}</h2>
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
                  <InspectorField label="¿Qué abre este botón?">
                    <select value={selectedCard.destination || selectedCard.id} onChange={event => updateCard({ destination: event.target.value as AppMenuDestination })}>
                      {[...(selection.kind === "main-card" ? mainMenuDestinationOptions : quizDestinationOptions), ...customDestinationOptions].map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </InspectorField>
                  {selection.kind === "quiz-card" && (
                    <InspectorField label="¿En qué grupo aparece?">
                      <select value={selectedCard.section || (selectedCard.id === "my-quizzes" ? "tools" : "main")} onChange={event => updateCard({ section: event.target.value as "main" | "tools" })}>
                        <option value="main">Opciones principales</option>
                        <option value="tools">Tus herramientas</option>
                      </select>
                    </InspectorField>
                  )}
                  <div className="order-controls">
                    <button onClick={() => moveSelectedCard(-1)} disabled={selectedCardIndex <= 0}>← Mover antes</button>
                    <button onClick={() => moveSelectedCard(1)} disabled={selectedCardIndex < 0 || selectedCardIndex === (selection.kind === "main-card" ? content.mainMenu.cards.length : content.quizMenu.cards.length) - 1}>Mover después →</button>
                  </div>
                  <button className="inspector-duplicate" onClick={duplicateSelectedCard}>＋ Duplicar botón funcional</button>
                  <button className="inspector-delete" onClick={deleteSelectedCard}>Quitar botón de la pantalla</button>
                </>
              )}
              {selectedSubject && (
                <SubjectFields
                  subject={selectedSubject}
                  selectedIndex={selectedIndex}
                  total={content.subjects.length}
                  onChange={updateSubject}
                  onMove={moveSubject}
                  onDuplicate={duplicateSubject}
                  onDelete={deleteSubject}
                />
              )}
              {selectedFlashcardSubject && (
                <>
                  <TextField label="Título" value={selectedFlashcardSubject.title} onChange={title => updateFlashcardSubject({ title })} />
                  <TextField label="Etiqueta" value={selectedFlashcardSubject.subtitle} onChange={subtitle => updateFlashcardSubject({ subtitle })} />
                  <TextField label="Descripción" value={selectedFlashcardSubject.description} multiline onChange={description => updateFlashcardSubject({ description })} />
                  <ColorField value={selectedFlashcardSubject.accentColor} onChange={accentColor => updateFlashcardSubject({ accentColor })} />
                  <InspectorField label="¿Qué decks abre?">
                    <select value={selectedFlashcardSubject.destination} onChange={event => updateFlashcardSubject({ destination: event.target.value as FlashcardSubjectDestination, subtitle: event.target.value === "coming-soon" ? "Próximamente" : selectedFlashcardSubject.subtitle })}>
                      {[...flashcardDestinationOptions, ...customDestinationOptions].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </InspectorField>
                  <div className="order-controls">
                    <button onClick={() => moveFlashcardSubject(-1)} disabled={selectedFlashcardSubjectIndex <= 0}>← Mover antes</button>
                    <button onClick={() => moveFlashcardSubject(1)} disabled={selectedFlashcardSubjectIndex === flashcardSubjects.length - 1}>Mover después →</button>
                  </div>
                  <button className="inspector-duplicate" onClick={duplicateFlashcardSubject}>＋ Duplicar deck</button>
                  <button className="inspector-delete" onClick={deleteFlashcardSubject}>Quitar deck de la pantalla</button>
                </>
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
          {pendingChanges.length > 0 && <div className="pending-changes"><strong>{pendingChanges.length} cambios pendientes</strong>{pendingChanges.map(change => <span key={change}>{change}</span>)}</div>}
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

function inspectorTitle(selection: Selection, card?: AppMenuCard, subject?: HomeSubject, flashcardSubject?: FlashcardSubjectBlock) {
  if (selection.kind === "main-header") return "Encabezado principal"
  if (selection.kind === "quiz-header") return "Encabezado de quizzes"
  return card?.title || subject?.title || flashcardSubject?.title || "Elemento"
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

function SubjectFields({ subject, selectedIndex, total, onChange, onMove, onDuplicate, onDelete }: { subject: HomeSubject; selectedIndex: number; total: number; onChange: (changes: Partial<HomeSubject>) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void }) {
  return (
    <>
      <TextField label="Título" value={subject.title} onChange={title => onChange({ title })} />
      <TextField label="Descripción" value={subject.subtitle} multiline onChange={subtitle => onChange({ subtitle })} />
      <TextField label="Texto del estado" value={subject.status} onChange={status => onChange({ status })} />
      <ColorField value={subject.accentColor} onChange={accentColor => onChange({ accentColor })} />
      <InspectorField label="¿Qué abre esta tarjeta?" hint="Podés dejarla como próximamente hasta crear su contenido.">
        <select value={subject.destination} onChange={event => onChange({ destination: event.target.value as SubjectDestination, status: event.target.value === "coming-soon" ? "Próximamente" : "Disponible" })}>
          {[...destinationOptions, ...customDestinationOptionsForSubjects].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <small className="destination-help">{destinationOptions.find(option => option.value === subject.destination)?.description || "Abre una pantalla creada en el constructor."}</small>
      </InspectorField>
      <div className="order-controls">
        <button onClick={() => onMove(-1)} disabled={selectedIndex <= 0}>← Mover antes</button>
        <button onClick={() => onMove(1)} disabled={selectedIndex === total - 1}>Mover después →</button>
      </div>
      <button className="inspector-duplicate" onClick={onDuplicate}>＋ Duplicar materia</button>
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

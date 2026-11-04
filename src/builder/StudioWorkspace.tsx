import { memo, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import { globalJournal } from "./globalHistory"
import ImportGuide from "./ImportGuide"
import ContentWizard from "./ContentWizard"
import { validateNavigation } from "@/content/appBuilder/navigationValidation"
import { setNavigationIssues } from "./draftStatus"
import type { CustomPage } from "@/content/appBuilder/customPageSchema"
import LibraryEditor from "./LibraryEditor"
import LiveAppBuilder from "./LiveAppBuilder"
import CustomPagesEditor from "./CustomPagesEditor"
import OpenQuizContentEditor from "./OpenQuizContentEditor"
import UniversalUiEditor from "./UniversalUiEditor"
import ProjectTools from "./ProjectTools"
import SectionsEditor from "./SectionsEditor"
import ChangelogEditor from "./ChangelogEditor"
import { organization, subjectSections, reviewClassPresentation, type Organization } from "@/content/appBuilder/organization"
import { studioBanks } from "@/content/studio/catalog"
import { customPages } from "@/content/appBuilder/customPages"
import { workspaceNavigate, type WorkspaceTarget, type BankIndex, type WrittenIndex } from "./workspaceBridge"
import { groupWrittenDecks } from "@/content/openQuizzes/categories"
import type { HomeContent, FlashcardSubjectBlock } from "@/content/appBuilder"
import "./workspace.css"

// Keep every editor mounted for drafts/save/undo, but do not redraw unrelated
// editors when the workspace toolbar or another editor's index changes.
const StableLibraryEditor = memo(LibraryEditor)
const StableWrittenEditor = memo(OpenQuizContentEditor)
const StablePagesEditor = memo(CustomPagesEditor)
const StableLiveAppBuilder = memo(LiveAppBuilder)
const StableSectionsEditor = memo(SectionsEditor)
const StableChangelogEditor = memo(ChangelogEditor)
const StableUniversalEditor = memo(UniversalUiEditor)
const StableContentWizard = memo(ContentWizard)
const StableImportGuide = memo(ImportGuide)

function initialTarget(): WorkspaceTarget { try { return JSON.parse(sessionStorage.getItem("odontoma-workspace-target") || "null") || { panel: "structure", view: "main-menu" } } catch { return { panel: "structure", view: "main-menu" } } }
const labels: Record<string, string> = { create: "Agregar contenido", formats: "Formatos y prompts para AI", library: "Contenido", structure: "Menús y tarjetas", pages: "Menú personalizado", written: "Preguntas escritas", preview: "App navegable", appearance: "Apariencia global", sections: "Subdivisiones", changelog: "Versión e historial de cambios" }
type PageIndex = Pick<CustomPage, "id" | "title" | "blocks">

export default function StudioWorkspace({ appearance }: { appearance: (active: boolean) => ReactNode }) {
  const [target, setTarget] = useState<WorkspaceTarget>(initialTarget)
  const [banks, setBanks] = useState<BankIndex[]>(() => studioBanks.map(b => ({ ...b, questions: b.questions.length, flashcards: b.flashcards.length })))
  const [pages, setPages] = useState<PageIndex[]>(customPages)
  const [structure, setStructure] = useState<{ home: HomeContent; decks: FlashcardSubjectBlock[] } | null>(null)
  const [written, setWritten] = useState<WrittenIndex>({ classes: [], decks: [] })
  const [org, setOrg] = useState<Organization>(organization)
  const [search, setSearch] = useState("")
  const [navOpen, setNavOpen] = useState(false)
  const historyState = useSyncExternalStore(globalJournal.subscribe, globalJournal.getSnapshot, globalJournal.getSnapshot)
  const [create, setCreate] = useState<"course" | "prepartial" | null>(null)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [help, setHelp] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigationIssues = useMemo(() => structure ? validateNavigation({ ...structure, pages, banks }) : [], [structure, pages, banks])
  useEffect(() => { setNavigationIssues(navigationIssues) }, [navigationIssues])
  useEffect(() => {
    const update = (e: Event) => setSaving((e as CustomEvent<boolean>).detail)
    window.addEventListener("odontoma-save-busy", update)
    return () => window.removeEventListener("odontoma-save-busy", update)
  }, [])
  const bank = banks.find(b => b.id === target.bankId)
  useEffect(() => {
    const area = target.panel === "structure" ? target.view === "flashcard-subjects" ? "decks" : "home" : ({ library: "library", written: "written", pages: "pages", sections: "organization", appearance: "theme", preview: "overrides", changelog: "changelog" } as Record<string, string>)[target.panel]
    if (area) globalJournal.setContext(area, target.id?.startsWith("__new") ? { ...target, id: undefined } : target)
  }, [target])
  useEffect(() => {
    const command = (e: Event) => {
      const next = (e as CustomEvent).detail === "redo" ? globalJournal.redo() : globalJournal.undo()
      if (next) workspaceNavigate(next as WorkspaceTarget)
    }
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select,[contenteditable=true]")) return
      if ((e.metaKey || e.ctrlKey) && ["z", "y"].includes(e.key.toLowerCase())) { e.preventDefault(); command(new CustomEvent("undo", { detail: e.shiftKey || e.key.toLowerCase() === "y" ? "redo" : "undo" })) }
    }
    window.addEventListener("odontoma-workspace-undo", command); window.addEventListener("keydown", key)
    return () => { window.removeEventListener("odontoma-workspace-undo", command); window.removeEventListener("keydown", key) }
  }, [])
  useEffect(() => {
    const navigate = (e: Event) => { const next = (e as CustomEvent<WorkspaceTarget>).detail; if (next.panel === "history") { window.dispatchEvent(new Event("odontoma-open-history")); return }; setTarget({ ...next, stamp: Date.now() }); setNavOpen(false); requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })) }
    const index = (e: Event) => { const { area, items } = (e as CustomEvent).detail; if (area === "banks") setBanks(items); else if (area === "pages") setPages(items); else if (area === "written") setWritten(items); else if (area === "structure") setStructure(items); else if (area === "organization") setOrg(items) }
    const history = () => {}
    window.addEventListener("odontoma-workspace-navigate", navigate); window.addEventListener("odontoma-workspace-index", index); window.addEventListener("odontoma-workspace-history", history)
    return () => { window.removeEventListener("odontoma-workspace-navigate", navigate); window.removeEventListener("odontoma-workspace-index", index); window.removeEventListener("odontoma-workspace-history", history) }
  }, [])
  useEffect(() => { sessionStorage.setItem("odontoma-workspace-target", JSON.stringify(target)) }, [target])
  const matches = (value: string) => !search.trim() || value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  const courses = banks.filter(b => !b.archived && b.kind === "course" && matches(`${b.title} ${b.subject} ${b.chapters.map(c => c.title).join(" ")}`))
  const reviews = banks.filter(b => !b.archived && b.kind === "prepartial" && matches(`${b.title} ${b.subject}`))
  const pick = (next: WorkspaceTarget) => workspaceNavigate(next)
  function treeBank(b: BankIndex) {
    return <details key={b.id} className="studio-bank-branch"><summary className={target.bankId === b.id ? "selected" : ""}>{b.title}<small>{b.questions} preguntas · {b.flashcards} tarjetas</small></summary><div className="studio-bank-actions"><button onClick={() => pick({ panel: "library", bankId: b.id, mode: "questions" })}>Quiz</button><button onClick={() => pick({ panel: "library", bankId: b.id, mode: "flashcards" })}>Flashcards</button>{b.kind === "course" && <button onClick={() => pick({ panel: "written", subject: b.subject })}>Escritas</button>}</div>{b.chapters.filter(c => matches(c.title) || matches(b.title)).map(c => <button key={c.id} className={target.bankId === b.id && target.chapterId === c.id ? "selected" : ""} onClick={() => pick({ panel: "library", bankId: b.id, chapterId: c.id, mode: target.mode || "questions" })}>▤ {c.title}</button>)}</details>
  }
  const previewDestination = target.panel === "changelog" ? "changelog" : target.panel === "written" ? "open-ended" : target.panel === "pages" && target.id ? `custom-page:${target.id}` : target.panel === "library" && bank ? bank.kind === "prepartial" ? "pre-partial" : `${target.mode === "flashcards" ? "flashcard-bank:" : "bank:"}${bank.id}` : target.panel === "structure" ? target.view === "flashcard-subjects" ? "flashcards" : target.view === "subjects" ? "multiple-choice" : target.view === "quiz-menu" ? "quizzes" : "home" : "home"
  return <main className="studio-shell">
    <header className="studio-topbar"><button className="studio-nav-toggle" aria-label="Abrir navegación del builder" onClick={() => setNavOpen(!navOpen)}>☰</button><div className="studio-brand"><span>O</span><div><strong>Odontoma Studio</strong><small>Privado · en tu computadora</small></div></div><div className="studio-undo"><button aria-label="Deshacer edición" title={"Deshacer global: " + historyState.undoLabel} disabled={!historyState.canUndo} onClick={() => window.dispatchEvent(new CustomEvent("odontoma-workspace-undo", { detail: "undo" }))}>↶</button><button aria-label="Rehacer edición" title={"Rehacer global: " + historyState.redoLabel} disabled={!historyState.canRedo} onClick={() => window.dispatchEvent(new CustomEvent("odontoma-workspace-undo", { detail: "redo" }))}>↷</button></div><ProjectTools /></header>
    <div className="studio-body" inert={saving}><aside className={`studio-tree ${navOpen ? "is-open" : ""}`} aria-label="Navegación del proyecto"><input aria-label="Buscar en el proyecto" placeholder="Buscar clase o menú…" value={search} onChange={e => setSearch(e.target.value)}/>
      <button className="studio-primary" onClick={() => pick({ panel: "create" })}>＋ Agregar contenido</button><button onClick={() => pick({ panel: "formats" })}>▧ Formatos y prompts para AI</button><p className="studio-tree-label">APP Y MENÚS</p>
      {[ ["main-menu", "⌂ Menú principal"], ["quiz-menu", "▣ Tipos de quiz"], ["subjects", "▦ Materias de quizzes"], ["flashcard-subjects", "▤ Materias de flashcards"] ].map(([view, title]) => <button key={view} className={target.panel === "structure" && target.view === view ? "selected" : ""} onClick={() => pick({ panel: "structure", view: view as WorkspaceTarget["view"] })}>{title}</button>)}
      <button onClick={() => pick({ panel: "sections" })}>⫶ Subdivisiones y organización</button>
      <button className={target.panel === "changelog" ? "selected" : ""} onClick={() => pick({ panel: "changelog" })}>≡ Versión e historial de cambios</button>
      <details open><summary>Menús personalizados <button aria-label="Crear menú" onClick={e => { e.preventDefault(); pick({ panel: "pages", id: "__new" }) }}>＋</button></summary>{pages.filter(p => matches(p.title)).map(p => <button key={p.id} className={target.panel === "pages" && target.id === p.id ? "selected" : ""} onClick={() => pick({ panel: "pages", id: p.id })}>↳ {p.title}</button>)}{!pages.length && <small>Creá un menú con ＋ y enlazalo desde cualquier botón.</small>}</details>
      <p className="studio-tree-label">CONTENIDO</p><details open><summary>Materias <button aria-label="Crear materia" onClick={e => { e.preventDefault(); setCreate("course"); setName(""); setSubject("") }}>＋</button></summary>{courses.map(treeBank)}</details>
      <details open><summary>Repaso pre-parcial <button aria-label="Crear clase o parcial de repaso" onClick={e => { e.preventDefault(); setCreate("prepartial"); setName(""); setSubject("") }}>＋</button></summary>{[...new Set(reviews.map(b => b.subject))].map(s => <details key={s}><summary>{reviewClassPresentation(s, org).title}<button aria-label={`Editar clase de repaso ${reviewClassPresentation(s, org).title}`} onClick={e => { e.preventDefault(); pick({ panel: "sections", id: "review-class", subject: s }) }}>✎</button></summary>{reviews.filter(b => b.subject === s).map(treeBank)}</details>)}</details>
      <details><summary>Cuestionarios escritos</summary><button onClick={() => pick({ panel: "written" })}>＋ Administrar clases y cuestionarios</button>{written.classes.filter(c => matches(c.name)).map(c => {
        const groups = groupWrittenDecks(written.decks.filter(d => d.subject === c.name).map(d => ({ ...d, questions: [] })), c.categories)
        const exam = (d: WrittenIndex["decks"][number]) => <button key={d.id} onClick={() => pick({ panel: "written", subject: c.name, id: d.id })}>{d.title}</button>
        return <details key={c.id}><summary>{c.name}</summary><button onClick={() => pick({ panel: "written", subject: c.name })}>✎ Categorías y cuestionarios</button>{groups.categories.map(group => <details key={group.id}><summary>{group.name}</summary>{group.decks.map(exam)}</details>)}{groups.ungrouped.map(exam)}</details>
      })}</details>
      {structure && <details><summary>Tarjetas por subdivisión</summary>{(["quizzes", "flashcards"] as const).map(scope => <details key={scope}><summary>{scope === "quizzes" ? "Quizzes" : "Flashcards"}</summary>{subjectSections<HomeContent["subjects"][number] | FlashcardSubjectBlock>(scope === "quizzes" ? structure.home.subjects : structure.decks, org[scope]).map(g => <details key={g.id}><summary>{g.title}</summary>{g.items.filter(s => matches(s.title)).map(s => <button key={s.id} onClick={() => pick({ panel: "structure", view: scope === "quizzes" ? "subjects" : "flashcard-subjects", id: s.id })}>{s.title}</button>)}</details>)}</details>)}</details>}
      <p className="studio-tree-label">HERRAMIENTAS</p><button className={target.panel === "preview" ? "selected" : ""} onClick={() => pick({ panel: "preview", destination: "home" })}>◉ Navegar y editar la app</button><button onClick={() => pick({ panel: "appearance" })}>◐ Apariencia global</button><button onClick={() => window.dispatchEvent(new Event("odontoma-open-history"))}>↶ Historial y backups</button><button onClick={() => setHelp(!help)}>？Cómo trabajar</button>
    </aside>
    <section className="studio-main"><header className="studio-contextbar"><div><small>ODONTOMA / {labels[target.panel] || "Proyecto"}</small><h1>{bank && target.panel === "library" ? `${bank.title} · ${target.mode === "flashcards" ? "Flashcards" : "Opción múltiple"}` : target.panel === "pages" ? pages.find(p => p.id === target.id)?.title || "Nuevo menú" : labels[target.panel]}</h1></div>{target.panel !== "preview" && <button onClick={() => pick({ panel: "preview", destination: previewDestination })}>◉ Ver esta parte en la app</button>}<a href="/" target="_blank" rel="noreferrer">Abrir app ↗</a></header>
      {help && <div className="studio-help"><button onClick={() => setHelp(false)}>×</button><h2>Un solo lugar para trabajar</h2><p>1. Elegí una clase o pantalla en el árbol. 2. Editá o importá; los borradores se conservan al cambiar de sección. 3. Probá el borrador sin guardar o usá Guardar en Odontoma para aplicar todo. 4. Probá la app y publicá con tu comando habitual.</p><p>Para agregar una subdivisión: Subdivisiones y organización. Para asignarle una materia: editá su tarjeta en Materias de quizzes/flashcards. Para crear un menú: ＋ en Menús personalizados; después elegilo en «¿Qué abre?» de un botón.</p><p>La vista navegable permite elegir el proyecto guardado o Probar borrador sin guardar. El borrador usa progreso temporal aislado; Actualizar borrador recarga los cambios más recientes. El historial restaura contenido editable, no código ni Vercel. Descargá el .tar.gz para una copia completa.</p></div>}
      <div hidden={target.panel !== "changelog"}><StableChangelogEditor active={target.panel === "changelog"} target={target.panel === "changelog" ? target : undefined}/></div>
      <div hidden={target.panel !== "create"}><StableContentWizard /></div><div hidden={target.panel !== "formats"}><StableImportGuide /></div><div hidden={target.panel !== "library"}><StableLibraryEditor active={target.panel === "library"} target={target.panel === "library" ? target : undefined}/></div>
      <div hidden={target.panel !== "structure"}><StableLiveAppBuilder active={target.panel === "structure"} target={target.panel === "structure" ? target : undefined}/></div>
      <div hidden={target.panel !== "pages"}><StablePagesEditor active={target.panel === "pages"} target={target.panel === "pages" ? target : undefined}/></div>
      <div hidden={target.panel !== "written"}><StableWrittenEditor active={target.panel === "written"} target={target.panel === "written" ? target : undefined}/></div>
      <div hidden={target.panel !== "sections"}><StableSectionsEditor active={target.panel === "sections"} target={target.panel === "sections" ? target : undefined}/></div>
      <div hidden={target.panel !== "preview"}><StableUniversalEditor active={target.panel === "preview"} target={target.panel === "preview" ? target : undefined}/></div>
      <div hidden={target.panel !== "appearance"}>{appearance(target.panel === "appearance")}</div>
    </section></div>
    {create && <div className="studio-modal-backdrop"><form className="studio-create-modal" role="dialog" aria-modal="true" aria-label={create === "course" ? "Crear materia" : "Crear repaso pre-parcial"} onSubmit={e => { e.preventDefault(); if (!name.trim() || !subject.trim()) return; pick({ panel: "library", id: create === "course" ? "__new-course" : "__new-prepartial", name: name.trim(), subject: subject.trim(), mode: "questions" }); setCreate(null) }}><h2>{create === "course" ? "Crear una materia" : "Crear un banco de repaso"}</h2><label>Clase<input autoFocus required placeholder="Bioquímica" value={subject} onChange={e => { setSubject(e.target.value); if (create === "course") setName(e.target.value) }}/></label><label>Nombre del banco<input required placeholder={create === "course" ? "Bioquímica" : "Parcial 3"} value={name} onChange={e => setName(e.target.value)}/></label><p>{create === "prepartial" ? "Los bancos con la misma clase se agrupan juntos. Cada parcial conserva su progreso independiente." : "Podrás agregar capítulos, preguntas y flashcards. Las escritas se administran con su propio banco."}</p><button className="studio-primary" type="submit">Crear y editar</button><button type="button" onClick={() => setCreate(null)}>Cancelar</button></form></div>}
  </main>
}

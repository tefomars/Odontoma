import { writeBrowserStorage } from "../lib/storageSafety"
import { useEffect, useState } from "react"
import { organization, validateOrganization, reviewClassPresentation, type Organization, type ReviewClassStyle } from "@/content/appBuilder/organization"
import { useHistoryState } from "./useHistoryState"
import { useDraftStatus } from "./draftStatus"
import { publishIndex, useWorkspaceBanks, useWorkspaceHistory, workspaceNavigate, type WorkspaceTarget } from "./workspaceBridge"

export default function SectionsEditor({ active, target }: { active: boolean; target?: WorkspaceTarget }) {
  const banks = useWorkspaceBanks()
  const reviewSubjects = [...new Set(banks.filter(b => b.kind === "prepartial" && !b.archived).map(b => b.subject))]
  const history = useHistoryState<Organization>(organization, 80, "organization")
  const [scope, setScope] = useState<"quizzes" | "flashcards">("flashcards")
  const [loaded, setLoaded] = useState(false)
  const [applied, setApplied] = useState<Organization>(organization)
  useDraftStatus("organization", loaded, history.state, applied)
  const [status, setStatus] = useState("")
  useWorkspaceHistory(active, history)
  useEffect(() => {
    fetch("/__odontoma-studio/organization").then(r => { if (!r.ok) throw new Error("No se pudo cargar la organización"); return r.json() }).then(value => {
      const raw = localStorage.getItem("odontoma-organization-draft-v1")
      setApplied(value); history.reset(raw ? JSON.parse(raw) : value); setLoaded(true)
    }).catch(e => setStatus(String(e)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!loaded) return
    writeBrowserStorage("odontoma-organization-draft-v1", JSON.stringify(history.state))
    publishIndex("organization", history.state)
    const flush = (event: Event) => { (event as CustomEvent).detail.files.organization = history.state }
    window.addEventListener("odontoma-flush-drafts", flush)
    return () => window.removeEventListener("odontoma-flush-drafts", flush)
  }, [history.state, loaded])
  function update(id: string, changes: object) { history.setState(org => ({ ...org, [scope]: org[scope].map(s => s.id === id ? { ...s, ...changes } : s) })) }
  function move(index: number, direction: number) { const list = [...history.state[scope]]; const to = index + direction; if (to < 0 || to >= list.length) return; [list[index], list[to]] = [list[to], list[index]]; history.setState(org => ({ ...org, [scope]: list })) }
  if (target?.id === "review-class" && target.subject) {
    const subject = target.subject
    const presentation = reviewClassPresentation(subject, history.state)
    const updateReview = (changes: Partial<ReviewClassStyle>) => history.setState(org => ({ ...org, reviewClasses: { ...org.reviewClasses, [subject]: { ...reviewClassPresentation(subject, org), ...changes } } }))
    return <section className="studio-sections-editor">
      <header><small>REPASO PRE-PARCIAL</small><h2>Editar clase</h2><p>Cambia el nombre de la tarjeta y del árbol, no los bancos, preguntas ni el progreso. Es independiente de la materia de los quizzes y flashcards normales.</p></header>
      <label>Clase<select value={subject} onChange={e => workspaceNavigate({ panel: "sections", id: "review-class", subject: e.target.value })}>{reviewSubjects.map(s => <option key={s} value={s}>{reviewClassPresentation(s, history.state).title}</option>)}</select></label>
      <article>
        <label>Nombre visible<input aria-label="Nombre visible de la clase de repaso" value={presentation.title} onChange={e => updateReview({ title: e.target.value })}/></label>
        <label>Descripción<textarea value={presentation.description} onChange={e => updateReview({ description: e.target.value })}/></label>
        <label>Símbolo<input value={presentation.symbol} maxLength={20} onChange={e => updateReview({ symbol: e.target.value })}/></label>
        <label>Color<input type="color" value={presentation.color} onChange={e => updateReview({ color: e.target.value })}/></label>
      </article>
      <article>
        <h3>Examen final acumulativo</h3>
        <label><input type="checkbox" checked={presentation.finalExamEnabled} onChange={e => updateReview({ finalExamEnabled: e.target.checked })}/> Mostrar examen final de esta clase</label>
        <label>Nombre del examen final<input aria-label="Nombre del examen final acumulativo" value={presentation.finalExamTitle} maxLength={180} onChange={e => updateReview({ finalExamTitle: e.target.value })}/></label>
        <p>Aparece al final de Opción múltiple cuando hay al menos dos parciales con preguntas. Combina sus bancos actuales automáticamente; editá las preguntas en sus parciales originales. No genera contenido ni duplica bancos guardados. El progreso del final es independiente.</p>
      </article>
      {!validateOrganization(history.state) && <p role="alert">Revisá los nombres y colores antes de guardar.</p>}
      <p>Usá Guardar en Odontoma para aplicar. Deshacer recupera la edición anterior.</p>
      <button onClick={() => workspaceNavigate({ panel: "preview", destination: "pre-partial" })}>Ver Repaso pre-parcial guardado</button>
    </section>
  }
  return <section className="studio-sections-editor"><header><small>ORGANIZACIÓN</small><h2>Subdivisiones de materias</h2><p>Creá grupos como «Materias principales», «Clases secundarias» o «Electivas». En cada tarjeta de materia podés elegir a cuál pertenece.</p></header>
    <div className="studio-segmented"><button className={scope === "quizzes" ? "active" : ""} onClick={() => setScope("quizzes")}>Opción múltiple</button><button className={scope === "flashcards" ? "active" : ""} onClick={() => setScope("flashcards")}>Flashcards</button></div>
    {reviewSubjects.length > 0 && <button onClick={() => workspaceNavigate({ panel: "sections", id: "review-class", subject: reviewSubjects[0] })}>Editar clases de Repaso pre-parcial</button>}
    <button disabled={!loaded} onClick={() => history.setState(org => ({ ...org, [scope]: [...org[scope], { id: `section-${crypto.randomUUID()}`, title: "Nueva subdivisión", description: "", color: "#a78bfa" }] }))}>＋ Agregar subdivisión</button>
    {history.state[scope].map((section, i) => <article key={section.id} draggable onDragStart={e => e.dataTransfer.setData("text/section", section.id)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const from = history.state[scope].findIndex(s => s.id === e.dataTransfer.getData("text/section")); if (from >= 0 && from !== i) { const list = [...history.state[scope]]; const [item] = list.splice(from, 1); list.splice(i, 0, item); history.setState(org => ({ ...org, [scope]: list })) } }}>
      <span className="studio-grip">⠿ {i + 1}</span><label>Nombre<input value={section.title} onChange={e => update(section.id, { title: e.target.value })}/></label><label>Descripción<input value={section.description} onChange={e => update(section.id, { description: e.target.value })}/></label><label>Color<input type="color" value={section.color} onChange={e => update(section.id, { color: e.target.value })}/></label><div><button disabled={!i} onClick={() => move(i, -1)}>↑</button><button disabled={i === history.state[scope].length - 1} onClick={() => move(i, 1)}>↓</button><button disabled={history.state[scope].length === 1} onClick={() => { if (confirm("¿Quitar esta subdivisión? Sus materias pasarán al primer grupo; no se borra contenido.")) history.setState(org => ({ ...org, [scope]: org[scope].filter(s => s.id !== section.id) })) }}>Quitar</button></div>
    </article>)}
    {!validateOrganization(history.state) && <p role="alert">Revisá que cada subdivisión tenga nombre y color válido antes de guardar.</p>}<p role="status">{status}</p>
  </section>
}

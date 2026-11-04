import { useState } from "react"
import { groupWrittenDecks } from "@/content/openQuizzes/categories"
import { useDraftReports } from "./draftStatus"
import { useWorkspaceBanks, useWorkspaceWritten, workspaceNavigate } from "./workspaceBridge"
import ImportPanel from "./ImportPanel"
import { formatNames, type ImportKind } from "./contentFormats"
import type { ImportedItem } from "./contentImport"
import type { ContentCreation, CreationEvent } from "./contentCreation"
import { globalJournal } from "./globalHistory"
import { ImageField } from "./LibraryEditor"

export default function ContentWizard() {
  const banks = useWorkspaceBanks(), written = useWorkspaceWritten()
  const ready = useDraftReports().every(r => r.ready)
  const [step, setStep] = useState(1)
  const [type, setType] = useState<ImportKind>("multiple-choice")
  const [kind, setKind] = useState<"course" | "prepartial">("course")
  const [bankId, setBankId] = useState("__new")
  const [chapterId, setChapterId] = useState("__new")
  const [deckId, setDeckId] = useState("__new")
  const [subject, setSubject] = useState("")
  const [title, setTitle] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [image, setImage] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const categories = groupWrittenDecks(written.decks.filter(d => d.subject === subject).map(d => ({ ...d, questions: [] })), written.classes.find(c => c.name === subject)?.categories).categories
  const [quizAccess, setQuizAccess] = useState(true), [flashcardAccess, setFlashcardAccess] = useState(true)
  const [items, setItems] = useState<ImportedItem[]>([])
  const [status, setStatus] = useState("")
  const [existingTexts, setExistingTexts] = useState<string[]>([])
  const bank = banks.find(b => b.id === bankId)
  const deck = written.decks.find(d => d.id === deckId)
  const newBank = bankId === "__new", newChapter = chapterId === "__new", newDeck = deckId === "__new"
  const destinationValid = type === "written" ? !!subject.trim() && (newDeck ? !!title.trim() : !!deck && deck.subject === subject) : (newBank ? !!subject.trim() && !!title.trim() : !!bank && bank.kind === kind && !bank.archived) && (newChapter ? !!chapterTitle.trim() : !!bank?.chapters.some(c => c.id === chapterId))
  function nextImport() {
    const event = { type, bankId, chapterId, deckId, texts: [] as string[] }
    window.dispatchEvent(new CustomEvent("odontoma-import-existing", { detail: event }))
    setExistingTexts(event.texts); setStep(3); setItems([]); setStatus("")
  }
  function commit() {
    const request: ContentCreation = { type, kind, subject: bank?.subject || subject.trim(), title: title.trim(), bankId: newBank ? crypto.randomUUID() : bankId, newBank, chapterId: newChapter ? `chapter-${crypto.randomUUID()}` : chapterId, newChapter, chapterTitle: chapterTitle.trim(), deckId: newDeck ? `open-deck-${crypto.randomUUID()}` : deckId, newDeck, image, quizAccess, flashcardAccess, sectionId: "primary", items, categoryName }
    if (type === "written") { request.subject = subject.trim(); request.title = deck?.title || title.trim() }
    const detail: CreationEvent = { request }
    globalJournal.batch(`Agregar ${formatNames[type]}`, () => {
      window.dispatchEvent(new CustomEvent("odontoma-create-content", { detail }))
      if (detail.accepted) window.dispatchEvent(new CustomEvent("odontoma-create-access", { detail }))
    })
    if (!detail.accepted || !detail.target) { setStatus(detail.error || "No se pudo agregar. Esperá a que carguen los editores."); return }
    setItems([]); setStep(1); setTitle(""); setChapterTitle(""); setImage(""); setStatus("Contenido agregado al borrador. Podés deshacer toda esta operación con una sola acción.")
    workspaceNavigate(detail.target)
  }
  return <section className="studio-wizard"><h2>Agregar contenido</h2><p>Elegí el tipo y destino, revisá el contenido y agregalo al borrador. No se publica automáticamente.</p><ol className="studio-wizard-steps">{["Tipo", "Destino", "Contenido", "Revisar y agregar"].map((s, i) => <li key={s} aria-current={step === i + 1 ? "step" : undefined}>{i + 1}. {s}</li>)}</ol>{step === 1 && <><label>¿Qué querés agregar?<select aria-label="Tipo de contenido a agregar" value={type} onChange={e => { setType(e.target.value as ImportKind); setKind("course"); setItems([]) }}>{Object.entries(formatNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>{type !== "written" && <label>Sección<select value={kind} onChange={e => { setKind(e.target.value as "course" | "prepartial"); setBankId("__new"); setChapterId("__new") }}><option value="course">Materia normal</option><option value="prepartial">Repaso pre-parcial (banco independiente)</option></select></label>}<button className="studio-primary" disabled={!ready} onClick={() => setStep(2)}>Elegir destino</button></>}{step === 2 && <>{type === "written" ? <><label>Clase<input list="studio-written-classes" value={subject} onChange={e => { setSubject(e.target.value); setDeckId("__new"); setCategoryName("") }}/><datalist id="studio-written-classes">{written.classes.map(c => <option key={c.id} value={c.name}/>)}</datalist></label><label>Cuestionario<select aria-label="Cuestionario de destino" value={deckId} onChange={e => setDeckId(e.target.value)}><option value="__new">＋ Nuevo cuestionario</option>{written.decks.filter(d => d.subject === subject).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label>{newDeck && <><label>Nombre del cuestionario<input value={title} onChange={e => setTitle(e.target.value)}/></label><label>Categoría (opcional)<input aria-label="Categoría del nuevo cuestionario" list="studio-written-categories" placeholder="Elegí una o escribí una nueva, ej. Año 1" maxLength={120} value={categoryName} onChange={e => setCategoryName(e.target.value)}/><datalist id="studio-written-categories">{categories.map(c => <option key={c.id} value={c.name}/>)}</datalist></label><p>Podés crear, renombrar y ordenar categorías desde el editor de la clase. Vacío = Sin categoría.</p></>}</> : <><label>Banco<select aria-label="Banco de destino" value={bankId} onChange={e => { setBankId(e.target.value); setChapterId("__new") }}><option value="__new">＋ Nuevo banco</option>{banks.filter(b => b.kind === kind && !b.archived).map(b => <option key={b.id} value={b.id}>{b.title} · {b.subject}</option>)}</select></label>{newBank && <><label>Clase<input placeholder="Citohistología" value={subject} onChange={e => setSubject(e.target.value)}/></label><label>Nombre del banco<input placeholder={kind === "prepartial" ? "Parcial 3 · Cito II" : "Nombre de la materia"} value={title} onChange={e => setTitle(e.target.value)}/></label></>}<label>Capítulo / bloque<select aria-label="Capítulo de destino" value={chapterId} onChange={e => setChapterId(e.target.value)}><option value="__new">＋ Nuevo capítulo / bloque</option>{bank?.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>{newChapter && <label>Título del capítulo / bloque<input value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}/></label>}</>}<button disabled={!destinationValid} className="studio-primary" onClick={nextImport}>Agregar contenido</button></>}{step === 3 && <><ImportPanel key={type + bankId + chapterId + deckId} kind={type} existing={existingTexts} destination={type === "written" ? `${subject} / ${deck?.title || title}` : `${bank?.title || title} / ${bank?.chapters.find(c => c.id === chapterId)?.title || chapterTitle}`} onConfirm={rows => { setItems(rows); setStep(4) }}/><button onClick={() => { setItems([]); setStep(4) }}>Crear vacío y editar manualmente</button></>}{step === 4 && <><h3>{formatNames[type]} · {items.length} elementos nuevos</h3><p>{type === "written" ? `${subject} / ${deck?.title || title}` : `${bank?.title || title} / ${bank?.chapters.find(c => c.id === chapterId)?.title || chapterTitle}`}</p>{type !== "written" && newChapter && <ImageField label="Portada del capítulo (opcional)" value={image} onChange={setImage}/>}<h3>¿Dónde aparecerá?</h3>{type !== "written" && newBank && kind === "course" ? <><label><input type="checkbox" checked={quizAccess} onChange={e => setQuizAccess(e.target.checked)}/> Tarjeta en materias de quizzes</label><label><input type="checkbox" checked={flashcardAccess} onChange={e => setFlashcardAccess(e.target.checked)}/> Tarjeta en materias de flashcards</label><p>Podrás mover estas tarjetas a otra subdivisión desde Menús y tarjetas. Quitar un acceso no borra el banco.</p></> : <p>{type === "written" ? "Quizzes → Respuestas abiertas → su clase → cuestionario." : kind === "prepartial" ? "Repaso pre-parcial → su clase → banco del parcial." : "Dentro del banco y capítulo existentes. No crea tarjetas de acceso adicionales."}</p>}<button className="studio-primary" disabled={!ready || !destinationValid} onClick={commit}>Confirmar y editar el borrador</button></>}{step > 1 && <button onClick={() => setStep(step - 1)}>← Paso anterior</button>}<p role="status">{status}</p><p>Deshacer global revierte esta creación/importación. Guardar en Odontoma la aplica localmente; después publicás por terminal como siempre.</p></section>
}

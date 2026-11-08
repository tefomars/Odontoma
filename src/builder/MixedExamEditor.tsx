import { useEffect, useState } from "react"
import { mixedContent } from "@/content/mixedExams"
import { importMixedExams, mixedKindLabel, newMixedExam, newMixedQuestion, validateMixedContent, type MixedContent, type MixedExam, type MixedQuestion } from "@/content/mixedExams/model"
import { writeBrowserStorage } from "@/lib/storageSafety"
import { useHistoryState } from "./useHistoryState"
import { useDraftStatus } from "./draftStatus"
import { downloadText } from "./ImportGuide"
import { ImageField } from "./LibraryEditor"
import { publishIndex, type WorkspaceTarget } from "./workspaceBridge"
import "./mixed-editor.css"

export const mixedExample: MixedContent = { version: 1, exams: [{ id: "ejemplo", title: "Título del examen", subject: "Nombre de la clase", category: "Parcial o categoría", description: "Contenido que evalúa.", enabled: false, shuffleQuestions: false, questions: [
  { id: "q1", kind: "choice", prompt: "¿Cuál alternativa describe el concepto?", options: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"], correctAnswers: [1], explanation: "Justificación de la alternativa B." },
  { id: "q2", kind: "true-false", prompt: "Afirmación precisa para evaluar.", correct: false, explanation: "Justificación y corrección de la afirmación." },
  { id: "q3", kind: "written", prompt: "¿Cómo se relacionan los conceptos?", modelAnswer: "Respuesta concreta que se espera.", acceptedPoints: ["Otro concepto aceptado"], explanation: "Explicación adicional separada de la respuesta modelo.", image: "", backImage: "" },
] }] }
export const mixedPrompt = `Generá un examen mixto para Odontoma basado EXCLUSIVAMENTE en el material que pegaré. No inventés contenido, imágenes ni URLs. Creá preguntas nuevas, no copies un examen anterior. Alterná choice, true-false y written según la cobertura solicitada. En choice usá distractores plausibles, personalizados, de longitud y detalle comparables y una respuesta inequívoca. correctAnswers contiene ÍNDICES DESDE CERO (B = 1); para selección múltiple es un arreglo de todos los índices correctos. En true-false correct es booleano y las falsas deben ser precisas, no ambiguas. En written separá modelAnswer, acceptedPoints y explanation. No uses "según los apuntes". Podés repetir los IDs de ejemplo solo como plantilla: el importador asignará IDs nuevos. Imágenes opcionales image/backImage; backImage se revela al comprobar en choice/true-false y al entregar en written. Entregá SOLO JSON válido con esta estructura, reemplazando los ejemplos por las preguntas solicitadas:\n${JSON.stringify(mixedExample, null, 2)}\n\nMATERIAL Y COBERTURA:\n[Pegá aquí el material y la cantidad por tipo]`
const draftKey = "odontoma-mixed-builder-draft-v1"
function moved<T>(items: T[], from: number, to: number) { if (to < 0 || to >= items.length) return items; const next = [...items], [item] = next.splice(from, 1); next.splice(to, 0, item); return next }
export default function MixedExamEditor({ active, target }: { active: boolean; target?: WorkspaceTarget }) {
  const history = useHistoryState<MixedContent>(mixedContent, 80, "mixed")
  const [applied, setApplied] = useState(mixedContent)
  const [loaded, setLoaded] = useState(false)
  const [recovered, setRecovered] = useState<MixedContent | null>(null)
  const [error, setError] = useState("")
  const [examId, setExamId] = useState("")
  const [questionId, setQuestionId] = useState("")
  const [importText, setImportText] = useState("")
  const [preview, setPreview] = useState<MixedExam[] | null>(null)
  const [append, setAppend] = useState(false)
  const [tools, setTools] = useState(false)
  const issues = validateMixedContent(history.state)
  useDraftStatus("mixed", loaded, history.state, applied, recovered ? "Revisá el borrador recuperado de exámenes completos." : issues[0])
  useEffect(() => {
    let alive = true
    fetch("/__odontoma-studio/mixed").then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json() }).then(value => {
      if (!alive) return
      const saved: MixedContent = value
      if (validateMixedContent(saved).length) throw new Error("No se pudo validar la biblioteca de exámenes completos.")
      let next = saved
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || "null")
        if (draft?.value?.version === 1 && Array.isArray(draft.value.exams)) {
          if (JSON.stringify(draft.base) === JSON.stringify(saved)) next = draft.value
          else if (JSON.stringify(draft.base) !== JSON.stringify(draft.value)) setRecovered(draft.value)
        }
      } catch { setError("No se pudo leer el borrador local. El proyecto no se modificó.") }
      setApplied(saved); history.reset(next); setLoaded(true)
    }).catch(e => { if (alive) setError(String(e)) })
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!loaded || recovered) return
    writeBrowserStorage(draftKey, JSON.stringify({ base: applied, value: history.state }))
    const flush = (e: Event) => { (e as CustomEvent).detail.files.mixed = history.state }
    window.addEventListener("odontoma-flush-drafts", flush)
    return () => window.removeEventListener("odontoma-flush-drafts", flush)
  }, [loaded, applied, history.state, recovered])
  useEffect(() => { publishIndex("mixed", history.state.exams.map(e => ({ id: e.id, title: e.title, subject: e.subject, questions: e.questions.length }))) }, [history.state])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Workspace selection, not content mutation.
    if (active && target?.id) setExamId(target.id)
  }, [active, target])
  const exam = history.state.exams.find(e => e.id === examId)
  const question = exam?.questions.find(q => q.id === questionId)
  function updateExam(patch: Partial<MixedExam>) { history.setState(s => ({ ...s, exams: s.exams.map(e => e.id === examId ? { ...e, ...patch } : e) })) }
  function updateQuestion(q: MixedQuestion) { if (exam) updateExam({ questions: exam.questions.map(item => item.id === q.id ? q : item) }) }
  function addExam() { const e = newMixedExam(); history.setState(s => ({ ...s, exams: [...s.exams, e] })); setExamId(e.id); setQuestionId("") }
  function addQuestion(kind: MixedQuestion["kind"]) { if (!exam) return; const q = newMixedQuestion(kind); updateExam({ questions: [...exam.questions, q] }); setQuestionId(q.id) }
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setError("Copiado.") } catch { setError("No se pudo copiar. Desplegá el formato y copialo manualmente.") } }
  return <section className="mixed-editor">
    <header><h2>Exámenes completos</h2><p>Bancos propios de opción múltiple, V/F y escritas. No se copia contenido de los otros bancos. Guardá localmente arriba y publicá por terminal.</p><div className="mixed-edit-actions"><button disabled={!loaded || !!recovered} onClick={addExam}>＋ Nuevo examen</button><button onClick={() => setTools(v => !v)}>Importar, exportar y prompt para AI</button></div></header>
    {error && <p role="status">{error}</p>}
    {recovered && <aside><p>Hay un borrador de otra versión. No se aplicó nada.</p><button onClick={() => { if (confirm("¿Recuperar estas ediciones como borrador para revisarlas?")) { history.setState(recovered); setRecovered(null) } }}>Recuperar para revisar</button><button onClick={() => { if (confirm("¿Conservar el proyecto guardado y descartar solo este borrador antiguo?")) setRecovered(null) }}>Conservar proyecto guardado</button></aside>}
    {tools && <section className="mixed-import"><h3>Importar JSON mixto</h3><p>Podés importar un examen o una biblioteca version: 1 / exams. Nunca reemplaza contenido: se asignan IDs nuevos. Revisá el resumen antes de confirmar.</p><div className="mixed-edit-actions"><button onClick={() => void copy(mixedPrompt)}>Copiar prompt para AI</button><button onClick={() => downloadText(JSON.stringify(mixedExample,null,2), "odontoma-mixto-ejemplo.json", "application/json")}>Descargar ejemplo JSON</button><button onClick={() => downloadText(JSON.stringify(history.state,null,2), "odontoma-examenes-completos.json", "application/json")}>Exportar biblioteca</button>{exam && <button onClick={() => downloadText(JSON.stringify({version:1,exams:[exam]},null,2),"odontoma-examen-mixto.json","application/json")}>Exportar este examen</button>}</div><details><summary>Ver formato y prompt completo</summary><textarea readOnly rows={12} value={mixedPrompt}/></details><label>Archivo JSON<input type="file" accept=".json" onChange={e => { const file = e.target.files?.[0]; if (file) { if (file.size > 30_000_000) { setError("El archivo supera 30 MB."); return }; void file.text().then(text => { setImportText(text); setPreview(null) }).catch(e => setError(String(e))) }; e.target.value = "" }}/></label><label>O pegá el JSON<textarea rows={6} value={importText} onChange={e => { setImportText(e.target.value); setPreview(null) }}/></label><button disabled={!loaded || !!recovered} onClick={() => { try { setPreview(importMixedExams(importText)); setError("") } catch(e) { setPreview(null); setError(String(e)) } }}>Validar y previsualizar</button>
      {preview && <aside><h3>Vista previa · nada agregado todavía</h3>{preview.map(e => <p key={e.id}>{e.subject} / {e.title} · {e.questions.length} preguntas ({["choice","true-false","written"].map(k => `${e.questions.filter(q => q.kind === k).length} ${k}`).join(" · ")})</p>)}{exam && <label><input type="checkbox" checked={append} onChange={e => setAppend(e.target.checked)}/> Agregar solo las preguntas a «{exam.title}»</label>}<button disabled={!loaded || !!recovered} onClick={() => {
        const next = append && exam ? { ...history.state, exams: history.state.exams.map(e => e.id === exam.id ? { ...e, questions: [...e.questions, ...preview.flatMap(p => p.questions)] } : e) } : { ...history.state, exams: [...history.state.exams, ...preview] }
        const errors = validateMixedContent(next); if (errors.length) { setError(errors.slice(0,6).join("\n")); return }
        history.setState(next); if (!(append && exam)) setExamId(preview[0]?.id || ""); setPreview(null); setImportText(""); setError("Agregado al borrador. Revisá y guardá arriba.")
      }}>Confirmar importación al borrador</button><button onClick={() => setPreview(null)}>Cancelar importación</button></aside>}
    </section>}
    <fieldset disabled={!loaded || !!recovered} className="mixed-editor-grid"><nav aria-label="Lista de exámenes completos">{history.state.exams.map((e,i) => <div className="mixed-edit-row" key={e.id}><button className={examId === e.id ? "selected" : ""} onClick={() => { setExamId(e.id); setQuestionId("") }}><strong>{e.title}</strong><small>{e.subject} · {e.questions.length} preguntas{!e.enabled ? " · Oculto" : ""}</small></button><button aria-label={`Subir examen ${e.title}`} disabled={!i} onClick={() => history.setState(s => ({ ...s, exams: moved(s.exams,i,i-1) }))}>↑</button><button aria-label={`Bajar examen ${e.title}`} disabled={i === history.state.exams.length-1} onClick={() => history.setState(s => ({ ...s, exams: moved(s.exams,i,i+1) }))}>↓</button></div>)}</nav>
      <div className="mixed-edit-body">{exam ? <>
        <div className="mixed-edit-meta"><label>Título<input value={exam.title} maxLength={180} onChange={e => updateExam({title:e.target.value})}/></label><label>Clase<input list="mixed-classes" value={exam.subject} maxLength={120} onChange={e => updateExam({subject:e.target.value})}/></label><datalist id="mixed-classes">{[...new Set(history.state.exams.map(e=>e.subject))].map(s=><option key={s} value={s}/>)}</datalist><label>Categoría / parcial / año<input value={exam.category} maxLength={120} onChange={e => updateExam({category:e.target.value})}/></label><label>Descripción<textarea rows={2} value={exam.description} maxLength={2000} onChange={e => updateExam({description:e.target.value})}/></label></div>
        <div className="mixed-edit-actions"><label><input type="checkbox" checked={exam.enabled} onChange={e => updateExam({enabled:e.target.checked})}/> Visible en Odontoma</label><label><input type="checkbox" checked={exam.shuffleQuestions} onChange={e => updateExam({shuffleQuestions:e.target.checked})}/> Mezclar preguntas</label><button onClick={() => { const copy = importMixedExams(JSON.stringify(exam))[0]; copy.title += " (copia)"; copy.enabled = false; history.setState(s => ({...s,exams:[...s.exams,copy]})); setExamId(copy.id) }}>Duplicar examen</button><button className="studio-danger" onClick={() => { if (confirm(`¿Quitar «${exam.title}» del borrador? Podés deshacerlo. Los intentos de estudiantes se conservan.`)) { history.setState(s => ({...s,exams:s.exams.filter(e=>e.id!==exam.id)})); setExamId("") } }}>Quitar examen</button></div>
        <p>Las opciones se mezclan al iniciar, conservando las claves. Si no marcás Mezclar preguntas se respeta el orden de abajo. Un examen vacío no aparece en la app.</p>
        <div className="mixed-edit-actions">{(["choice","true-false","written"] as const).map(k=><button key={k} onClick={()=>addQuestion(k)}>＋ {mixedKindLabel(k)}</button>)}</div>
        <div className="mixed-question-editor"><nav aria-label="Preguntas del examen mixto">{exam.questions.map((q,i)=><div className="mixed-edit-row" key={q.id} draggable onDragStart={e=>e.dataTransfer.setData("text/odontoma-mixed",q.id)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); const from=exam.questions.findIndex(q=>q.id===e.dataTransfer.getData("text/odontoma-mixed")); if(from>=0)updateExam({questions:moved(exam.questions,from,i)})}}><button className={q.id===questionId?"selected":""} onClick={()=>setQuestionId(q.id)}><small>{i+1} · {mixedKindLabel(q.kind)}</small><strong>{q.prompt || "Completá el enunciado"}</strong></button><button aria-label={`Subir pregunta ${i+1}`} disabled={!i} onClick={()=>updateExam({questions:moved(exam.questions,i,i-1)})}>↑</button><button aria-label={`Bajar pregunta ${i+1}`} disabled={i===exam.questions.length-1} onClick={()=>updateExam({questions:moved(exam.questions,i,i+1)})}>↓</button></div>)}</nav>
          <div>{question ? <>
            <label>Tipo de pregunta<select value={question.kind} onChange={e=>{if(confirm("¿Cambiar el tipo? Reemplaza sus opciones o respuesta modelo. Podés deshacerlo.")) updateQuestion({...newMixedQuestion(e.target.value as MixedQuestion["kind"]),id:question.id,prompt:question.prompt,explanation:question.explanation,image:question.image,imageAlt:question.imageAlt,backImage:question.backImage,backImageAlt:question.backImageAlt})}}>{(["choice","true-false","written"] as const).map(k=><option key={k} value={k}>{mixedKindLabel(k)}</option>)}</select></label>
            <label>Pregunta / afirmación<textarea rows={4} value={question.prompt} maxLength={6000} onChange={e=>updateQuestion({...question,prompt:e.target.value})}/></label>
            {question.kind === "choice" && <><p>Marcá la(s) correcta(s). Más de una activa selección múltiple, sin crédito parcial.</p>{question.options.map((o,i)=><div key={i} className="mixed-choice-edit"><label><input type="checkbox" aria-label={`Opción ${String.fromCharCode(65+i)} correcta`} checked={question.correctAnswers.includes(i)} onChange={e=>updateQuestion({...question,correctAnswers:e.target.checked?[...question.correctAnswers,i]:question.correctAnswers.filter(n=>n!==i)})}/>{String.fromCharCode(65+i)}</label><textarea aria-label={`Texto de opción ${String.fromCharCode(65+i)}`} rows={2} value={o} onChange={e=>updateQuestion({...question,options:question.options.map((v,n)=>n===i?e.target.value:v)})}/><button disabled={question.options.length<=2} aria-label={`Quitar opción ${String.fromCharCode(65+i)}`} onClick={()=>updateQuestion({...question,options:question.options.filter((_,n)=>n!==i),correctAnswers:question.correctAnswers.filter(n=>n!==i).map(n=>n>i?n-1:n)})}>×</button></div>)}<button disabled={question.options.length>=8} onClick={()=>updateQuestion({...question,options:[...question.options,""]})}>＋ Opción</button></>}
            {question.kind === "true-false" && <label>Respuesta correcta<select value={String(question.correct)} onChange={e=>updateQuestion({...question,correct:e.target.value==="true"})}><option value="true">Verdadero</option><option value="false">Falso</option></select></label>}
            {question.kind === "written" && <><label>Respuesta modelo<textarea rows={5} value={question.modelAnswer} maxLength={12000} onChange={e=>updateQuestion({...question,modelAnswer:e.target.value})}/></label><label>También se considera correcto mencionar (una frase por línea)<textarea rows={3} value={question.acceptedPoints.join("\n")} onChange={e=>updateQuestion({...question,acceptedPoints:e.target.value.split("\n")})}/></label></>}
            <label>Explicación (separada de la respuesta)<textarea rows={4} value={question.explanation || ""} maxLength={12000} onChange={e=>updateQuestion({...question,explanation:e.target.value})}/></label>
            <ImageField label="Imagen de la pregunta" value={question.image} onChange={image=>updateQuestion({...question,image})}/><label>Descripción de imagen de pregunta<input value={question.imageAlt || ""} onChange={e=>updateQuestion({...question,imageAlt:e.target.value})}/></label>
            <ImageField label="Imagen de la respuesta (al comprobar o revelar el modelo)" value={question.backImage} onChange={backImage=>updateQuestion({...question,backImage})}/><label>Descripción de imagen de respuesta<input value={question.backImageAlt || ""} onChange={e=>updateQuestion({...question,backImageAlt:e.target.value})}/></label>
            <div className="mixed-edit-actions"><button onClick={()=>{const q={...structuredClone(question),id:`mixed-q-${crypto.randomUUID()}`};updateExam({questions:[...exam.questions,q]});setQuestionId(q.id)}}>Duplicar pregunta</button><button className="studio-danger" onClick={()=>{if(confirm("¿Quitar esta pregunta? Podés deshacerlo.")){updateExam({questions:exam.questions.filter(q=>q.id!==question.id)});setQuestionId("")}}}>Quitar pregunta</button></div>
          </> : <p>Elegí una pregunta o agregá la primera.</p>}</div>
        </div>
      </> : <p>Creá un examen vacío o elegí uno de la lista. El contenido nuevo pertenece únicamente a esta sección.</p>}</div>
    </fieldset>
    {!!issues.length && <aside role="alert"><h3>Revisar antes de guardar</h3><ul>{issues.slice(0,10).map((issue,i)=><li key={i}>{issue}</li>)}</ul></aside>}
  </section>
}

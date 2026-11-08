import { useEffect, useState } from "react"
import { mixedContent } from "@/content/mixedExams"
import { mixedKindLabel, type MixedExam, type MixedQuestion, type MixedContent } from "@/content/mixedExams/model"
import { checkMixedAnswer, updateMixedAnswer, clearMixedSession, createMixedSession, loadMixedSession, mixedAnswerPresent, mixedAttempt, mixedGrade, mixedSessionKey, prepareMixedRetry, saveMixedSession, type MixedAnswer, type MixedGrade } from "@/lib/mixedExamSession"
import { saveQuizAttempt, type QuizAttempt } from "@/lib/quizHistory"
import StudyImage from "./StudyImage"
import QuizReviewScreen from "./QuizReviewScreen"
import "./mixed-exams.css"

type Props = { onBack: () => void; onMainMenu: () => void; initialRetry?: QuizAttempt | null; content?: MixedContent }
export default function MixedExamsScreen({ onBack, onMainMenu, initialRetry, content = mixedContent }: Props) {
  const [subject, setSubject] = useState<string | null>(initialRetry?.subject || null)
  const [initialRetryResult] = useState(() => initialRetry ? prepareMixedRetry(initialRetry) : null)
  const [exam, setExam] = useState<MixedExam | null>(initialRetryResult?.exam || null)
  const [running, setRunning] = useState(!!initialRetryResult?.exam)
  const [retryError, setRetryError] = useState(initialRetryResult?.error || "")
  const [run, setRun] = useState(0)
  const exams = content.exams.filter(e => e.enabled && e.questions.length)
  const subjects = [...new Set(exams.map(e => e.subject))]
  function back() {
    if (running) { window.dispatchEvent(new Event("odontoma-mixed-session-back")); return }
    if (exam) { setExam(null); return }
    if (subject) { setSubject(null); return }
    onBack()
  }
  useEffect(() => {
    window.addEventListener("odontoma-mixed-back", back)
    return () => window.removeEventListener("odontoma-mixed-back", back)
  })
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }) }, [subject, exam, running])
  if (running && exam) return <MixedSessionScreen key={`${exam.id}-${run}`} exam={exam} retryError={retryError} onBack={() => setRunning(false)} onChooseExams={() => { setRunning(false); setExam(null) }} onMainMenu={onMainMenu} onRepeat={() => { setRetryError(""); setRun(n => n + 1) }} onRetry={attempt => { const result = prepareMixedRetry(attempt); setRetryError(result.error || ""); if (result.exam) { setExam(result.exam); setRun(n => n + 1) } }}/>
  return <main className="mixed-shell" data-screen-key={exam ? `mixed-details-${exam.id}` : subject ? `mixed-class-${encodeURIComponent(subject)}` : "mixed-catalog"}><div className="mixed-wrap">
    <MixedNav onBack={back} onMainMenu={onMainMenu}/>
    <p className="mixed-eyebrow">OPCIÓN MÚLTIPLE · V/F · ESCRITAS</p>
    <h1>{exam ? exam.title : subject || "Exámenes completos"}</h1>
    {retryError && <p role="alert" className="mixed-retry-error">{retryError}</p>}
    {exam ? <section className="mixed-panel">
      <p>{exam.description || "Un examen con preguntas de distintos tipos en una misma sesión."}</p>
      <p className="mixed-muted">{exam.category} · {exam.questions.length} preguntas · {exam.shuffleQuestions ? "Orden aleatorio" : "Orden del autor"}</p>
      <p>Opción múltiple y V/F tienen retroalimentación inmediata al pulsar Comprobar. La respuesta queda fijada para este intento. Las escritas las evaluás contra la respuesta modelo al entregar. Todas valen 1 punto; una escrita parcial vale 0.5.</p>
      <button className="mixed-primary" onClick={() => setRunning(true)}>{loadMixedSession(mixedSessionKey(exam.id), exam.id) ? "Continuar examen" : "Comenzar examen"}</button>
      {loadMixedSession(mixedSessionKey(exam.id), exam.id) && <button onClick={() => { if (confirm("¿Descartar solo el avance pendiente de este examen? Los intentos terminados se conservan." ) && clearMixedSession(mixedSessionKey(exam.id))) { setRun(n => n + 1); setRunning(true) } }}>Empezar de nuevo</button>}
    </section> : !subject ? <>
      <p className="mixed-muted">Elegí una clase. Estos exámenes tienen contenido propio y no toman preguntas de otros bancos.</p>
      <div className="mixed-grid">{subjects.map(s => <button className="mixed-panel mixed-card" key={s} onClick={() => setSubject(s)}><h2>{s}</h2><p>{exams.filter(e => e.subject === s).length} exámenes →</p></button>)}</div>
      {!subjects.length && <section className="mixed-panel"><h2>Todavía no hay exámenes completos</h2><p>Se agregan desde el Builder privado. No se generó ni se copió contenido de otros bancos.</p></section>}
    </> : <div className="mixed-grid">{[...new Set(exams.filter(e => e.subject === subject).map(e => e.category))].map(category => <section key={category} className="mixed-category"><h2>{category || "Sin categoría"}</h2>{exams.filter(e => e.subject === subject && e.category === category).map(e => <button className="mixed-panel mixed-card" key={e.id} onClick={() => setExam(e)}><h3>{e.title}</h3><p>{e.description}</p><small>{e.questions.length} preguntas →</small></button>)}</section>)}</div>}
  </div></main>
}
export function MixedNav({ onBack, onMainMenu }: { onBack: () => void; onMainMenu: () => void }) {
  return <nav className="mixed-nav"><button onClick={onBack}>← Volver</button><button onClick={onMainMenu}>Menú principal</button></nav>
}
export function MixedSessionScreen({ exam, onBack, onChooseExams, onMainMenu, onRepeat, onRetry, retryError }: { exam: MixedExam; onBack: () => void; onChooseExams: () => void; onMainMenu: () => void; onRepeat: () => void; onRetry: (attempt: QuizAttempt) => void; retryError?: string }) {
  const key = mixedSessionKey(exam.id)
  const [session, setSession] = useState(() => loadMixedSession(key, exam.id) || createMixedSession(exam))
  const [completed, setCompleted] = useState<QuizAttempt | null>(null)
  const [review, setReview] = useState(false)
  const currentIndex = session.current
  const question = session.exam.questions[session.current]
  const answer = session.answers[question.id] || { text: "", selected: [] }
  const checked = session.checkedQuestionIds.includes(question.id)
  const written = session.exam.questions.filter(q => q.kind === "written" && mixedAnswerPresent(q, session.answers[q.id]))
  const pendingGrades = written.filter(q => !session.grades[q.id])
  function leave(destination = onBack) { if (completed || saveMixedSession(key, session)) destination() }
  useEffect(() => { if (!completed) saveMixedSession(key, session) }, [key, session, completed])
  useEffect(() => {
    const back = () => { if (review) setReview(false); else leave() }
    window.addEventListener("odontoma-mixed-session-back", back)
    return () => window.removeEventListener("odontoma-mixed-session-back", back)
  })
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }) }, [currentIndex, session.phase, completed, review])
  function updateAnswer(next: MixedAnswer) { setSession(s => updateMixedAnswer(s, question.id, next)) }
  function checkAnswer() { setSession(s => checkMixedAnswer(s, question.id)) }
  function choose(i: number) {
    const multiple = question.kind === "choice" && question.correctAnswers.length > 1
    updateAnswer({ text: "", selected: multiple ? answer.selected.includes(i) ? answer.selected.filter(n => n !== i) : [...answer.selected, i] : [i] })
  }
  function finish() {
    const attempt = mixedAttempt(session)
    if (attempt.responses.some(r => r.grade === "ungraded")) return
    if (!saveQuizAttempt(attempt)) return
    if (!clearMixedSession(key)) return
    setCompleted(attempt)
  }
  function submit() {
    const pending = session.exam.questions.filter(q => !mixedAnswerPresent(q, session.answers[q.id])).length
    if (pending && !confirm(`Hay ${pending} preguntas sin responder. ¿Entregar el examen de todos modos?`)) return
    if (written.length) setSession(s => ({ ...s, phase: "grading", current: s.exam.questions.findIndex(q => q.id === written[0].id) }))
    else finish()
  }
  function grade(value: MixedGrade) { setSession(s => ({ ...s, grades: { ...s.grades, [question.id]: value } })) }
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (completed || session.phase !== "answering" || target?.closest("input,textarea,select,[contenteditable=true]") || (target?.closest("button") && !target.closest("[data-mixed-option]"))) return
      if (e.repeat) { if (["Enter", " "].includes(e.key) || /^[1-8]$/.test(e.key)) e.preventDefault(); return }
      if (question.kind !== "written" && /^[1-8]$/.test(e.key)) {
        const i = Number(e.key) - 1, count = question.kind === "choice" ? question.options.length : 2
        if (i < count) { e.preventDefault(); if (!checked) choose(i) }
      }
      if ((e.key === "Enter" || e.key === " ") && mixedAnswerPresent(question, answer)) {
        e.preventDefault()
        if (question.kind !== "written" && !checked) checkAnswer()
        else if (session.current < session.exam.questions.length - 1) setSession(s => ({ ...s, current: s.current + 1 }))
      }
    }
    window.addEventListener("keydown", keyboard); return () => window.removeEventListener("keydown", keyboard)
  })
  if (completed && review) return <QuizReviewScreen attempt={completed} onBack={() => setReview(false)} onMainMenu={onMainMenu}/>
  if (completed) return <main className="mixed-shell"><div className="mixed-wrap"><MixedNav onBack={onBack} onMainMenu={onMainMenu}/><p className="mixed-eyebrow">EXAMEN TERMINADO</p><h1>{completed.title}</h1>{retryError && <p role="alert" className="mixed-retry-error">{retryError}</p>}<section className="mixed-panel"><h2>{completed.score} / {completed.total} puntos</h2><div className="mixed-actions">{(["correct", "partial", "incorrect", "unanswered"] as const).map(g => <span key={g}>{({correct:"Correctas",partial:"Parciales",incorrect:"Incorrectas",unanswered:"Sin responder"})[g]}: {completed.responses.filter(r => r.grade === g).length}</span>)}</div><div className="mixed-actions"><button className="mixed-primary" onClick={() => setReview(true)}>Ver respuestas</button><button onClick={onRepeat}>Repetir examen</button>{completed.responses.some(r => r.grade === "incorrect") && <button onClick={() => onRetry(completed)}>Repasar incorrectas</button>}<button onClick={onChooseExams}>Más exámenes de esta clase</button></div><p className="mixed-muted">Guardado en Exámenes anteriores · Mixtos. La parte escrita es autoevaluada.</p></section></div></main>
  const grading = session.phase === "grading"
  return <main className="mixed-shell" data-screen-key={`mixed-session-${exam.id}`}><div className="mixed-wrap">
    <nav className="mixed-nav"><button onClick={() => leave()}>💾 Guardar y salir</button><button onClick={() => leave(onMainMenu)}>Menú principal</button></nav>
    <p className="mixed-eyebrow">{session.exam.subject} · {mixedKindLabel(question.kind)}</p><h1 className="mixed-session-title">{session.exam.title}</h1>
    <p className="mixed-muted">{grading ? `Evaluá las escritas · ${pendingGrades.length} pendientes` : `Pregunta ${session.current + 1} de ${session.exam.questions.length} · ${session.exam.questions.filter(q => mixedAnswerPresent(q, session.answers[q.id])).length} respondidas`}</p>
    <section className="mixed-panel"><h2>{question.prompt}</h2><StudyImage src={question.image} alt={question.imageAlt}/>
      {grading ? <>
        <h3>Tu respuesta</h3><p className="mixed-answer">{answer.text}</p>
        {question.kind === "written" && <><div className="mixed-model"><h3>Respuesta modelo</h3><p>{question.modelAnswer}</p><StudyImage src={question.backImage} alt={question.backImageAlt}/>{question.acceptedPoints.filter(Boolean).length > 0 && <><h4>También se considera correcto mencionar</h4><ul>{question.acceptedPoints.filter(Boolean).map((p,i) => <li key={i}>{p}</li>)}</ul></>}</div>{question.explanation && <div className="mixed-explanation"><h3>Explicación</h3><p>{question.explanation}</p></div>}<p>Compará tu respuesta y evaluá qué tan completa fue:</p><div className="mixed-actions">{(["incorrect", "partial", "correct"] as const).map(g => <button aria-pressed={session.grades[question.id] === g} key={g} onClick={() => grade(g)}>{({incorrect:"Incorrecta · 0",partial:"Parcial · 0.5",correct:"Correcta · 1"})[g]}</button>)}</div></>}
      </> : question.kind === "written" ? <label className="mixed-label">Tu respuesta<textarea rows={7} value={answer.text} maxLength={12000} onChange={e => updateAnswer({ text: e.target.value, selected: [] })} placeholder="Escribí tu respuesta…"/></label> : <>
        {question.kind === "choice" && question.correctAnswers.length > 1 && <p>Seleccioná todas las respuestas correctas.</p>}
        <div className="mixed-options">{(question.kind === "choice" ? question.options : ["Verdadero", "Falso"]).map((option,i) => {
          const correct = (question.kind === "choice" ? question.correctAnswers : [question.correct ? 0 : 1]).includes(i)
          return <button data-mixed-option="" data-result={checked ? correct ? "correct" : answer.selected.includes(i) ? "incorrect" : undefined : undefined} disabled={checked} aria-pressed={answer.selected.includes(i)} key={i} onClick={() => choose(i)}><span>{question.kind === "choice" ? String.fromCharCode(65+i) : i+1}</span>{option}</button>
        })}</div>
        {checked && <MixedObjectiveFeedback question={question} answer={answer}/>}
      </>}
    </section>
    <div className="mixed-actions">{grading ? <>
      <button disabled={written.findIndex(q => q.id === question.id) <= 0} onClick={() => { const prev = written[written.findIndex(q => q.id === question.id)-1]; if (prev) setSession(s => ({ ...s, current: s.exam.questions.findIndex(q => q.id === prev.id) })) }}>← Escrita anterior</button>
      <button disabled={!session.grades[question.id] || written.findIndex(q => q.id === question.id) >= written.length-1} onClick={() => { const next = written[written.findIndex(q => q.id === question.id)+1]; if (next) setSession(s => ({ ...s, current: s.exam.questions.findIndex(q => q.id === next.id) })) }}>Siguiente escrita →</button>
      <button className="mixed-primary" disabled={!!pendingGrades.length} onClick={finish}>Guardar resultado</button>
    </> : <>
      <button disabled={!session.current} onClick={() => setSession(s => ({ ...s, current: s.current-1 }))}>← Anterior</button>
      {question.kind !== "written" && !checked && <button className="mixed-primary" disabled={!mixedAnswerPresent(question, answer)} onClick={checkAnswer}>Comprobar</button>}
      {session.current < session.exam.questions.length-1 && <button className={question.kind === "written" || checked ? "mixed-primary" : ""} onClick={() => setSession(s => ({ ...s, current: s.current+1 }))}>{question.kind !== "written" && !checked ? "Omitir por ahora →" : "Siguiente →"}</button>}
      <button onClick={submit}>Entregar examen</button>
    </>}</div>
    {!grading && <details className="mixed-panel"><summary>Ir a una pregunta</summary><div className="mixed-question-nav">{session.exam.questions.map((q,i) => <button key={q.id} aria-current={i === session.current ? "step" : undefined} onClick={() => setSession(s => ({ ...s, current: i }))}>{i+1}{mixedAnswerPresent(q, session.answers[q.id]) ? " ✓" : ""}</button>)}</div></details>}
  </div></main>
}
export function MixedObjectiveFeedback({ question, answer }: { question: MixedQuestion; answer: MixedAnswer }) {
  if (question.kind === "written") return null
  const correct = mixedGrade(question, answer) === "correct"
  const options = question.kind === "choice" ? question.options : ["Verdadero", "Falso"]
  const indices = question.kind === "choice" ? question.correctAnswers : [question.correct ? 0 : 1]
  return <section role="status" aria-live="polite" className={`mixed-feedback ${correct ? "is-correct" : "is-incorrect"}`}>
    <h3>{correct ? "✓ Correcta" : "✕ Incorrecta"}</h3>
    <div className="mixed-model"><h4>{indices.length > 1 ? "Respuestas correctas" : "Respuesta correcta"}</h4><ul>{indices.map(i => <li key={i}>{options[i]}</li>)}</ul><StudyImage src={question.backImage} alt={question.backImageAlt || "Imagen de la respuesta correcta"}/></div>
    {question.explanation && <div className="mixed-explanation"><h4>Explicación</h4><p>{question.explanation}</p></div>}
  </section>
}

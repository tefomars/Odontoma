import { beforeEach, describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { validateMixedContent, importMixedExams, newMixedExam, newMixedQuestion, type MixedExam } from "./model"
import { checkMixedAnswer, updateMixedAnswer, createMixedSession, mixedGrade, mixedAttempt, prepareMixedRetry, retryMixedExam, saveMixedSession, loadMixedSession, mixedSessionKey, clearMixedSession } from "@/lib/mixedExamSession"
import { loadQuizHistory, saveQuizAttempt } from "@/lib/quizHistory"
import QuizReviewScreen from "@/components/QuizReviewScreen"
import MixedExamsScreen, { MixedSessionScreen } from "@/components/MixedExamsScreen"
import { memoryStorage } from "@/builder/previewIsolation"
import { isCustomPageDestination } from "@/content/appBuilder/customPageSchema"
import { mixedContent } from "."
import { validatePreviewContent } from "@/builder/previewValidation"

export const sampleExam = (): MixedExam => ({ id: "mixed-test", title: "Prueba mixta", subject: "Clase", category: "Año 2", enabled: true, description: "Ejemplo de prueba", shuffleQuestions: false, questions: [
  { id: "a", kind: "choice", prompt: "Elegí dos", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correctAnswers: [1,3], explanation: "Explicación de opciones", image:"/media/front.png", backImage:"/media/back.png" },
  { id: "b", kind: "true-false", prompt: "Una afirmación", correct: false, explanation: "Corrección" },
  { id: "c", kind: "written", prompt: "Definí un término", modelAnswer: "Respuesta modelo", acceptedPoints: ["Dos palabras"], explanation: "Explicación distinta", backImage:"/media/written-answer.png" },
] })
beforeEach(() => { Object.defineProperty(globalThis, "localStorage", { value: memoryStorage(), configurable: true }) })
describe("exámenes mixtos: contenido independiente", () => {
  it("admite una biblioteca vacía y un destino editable sin exigir contenido premade", () => {
    expect(validateMixedContent(mixedContent)).toEqual([])
    expect(isCustomPageDestination("mixed-exams")).toBe(true)
    const html = renderToStaticMarkup(<MixedExamsScreen content={{version:1,exams:[]}} onBack={()=>{}} onMainMenu={()=>{}}/>)
    expect(html).toContain("Todavía no hay exámenes completos")
    const e = newMixedExam(); expect(e.enabled).toBe(false); expect(e.questions).toEqual([])
    expect(validateMixedContent({version:1,exams:[e]})).toEqual([])
  })
  it("valida claves por tipo, opciones únicas, IDs e imágenes", () => {
    const e = sampleExam(); expect(validateMixedContent({version:1,exams:[e]})).toEqual([])
    const choice = e.questions[0]; if(choice.kind!=="choice")throw Error()
    choice.correctAnswers = [8]
    expect(validateMixedContent({version:1,exams:[e]}).join()).toContain("correctas")
    choice.correctAnswers=[0]; choice.options[1]=choice.options[0]
    expect(validateMixedContent({version:1,exams:[e]}).join()).toContain("repetidas")
    e.questions[0].backImage="javascript:alert(1)"
    expect(validateMixedContent({version:1,exams:[e]}).join()).toContain("imagen inválida")
    const fresh=sampleExam();fresh.questions[1].id=fresh.questions[0].id
    expect(validateMixedContent({version:1,exams:[fresh]}).join()).toContain("ID vacío o repetido")
    expect(newMixedQuestion("written").kind).toBe("written")
  })
  it("importa aditivamente con IDs nuevos sin alterar el archivo exportado", () => {
    const e=sampleExam(), raw=JSON.stringify(e)
    const a=importMixedExams(raw)[0], b=importMixedExams(JSON.stringify({version:1,exams:[e]}))[0]
    expect(a.id).not.toBe(e.id);expect(a.id).not.toBe(b.id)
    expect(a.questions.map(q=>q.prompt)).toEqual(e.questions.map(q=>q.prompt))
    expect(new Set([...a.questions,...b.questions].map(q=>q.id)).size).toBe(6)
    expect(a.questions[0].backImage).toBe(e.questions[0].backImage)
    expect(JSON.stringify(e)).toBe(raw)
    expect(()=>importMixedExams('{"exams":[]}')).toThrow()
  })
})
describe("sesión mixta: orden, corrección y reanudación", () => {
  it("permite repasar desde resultados aun con un título de 180 caracteres y repetir el repaso", () => {
    const exam=sampleExam();exam.title="A".repeat(180)
    const s=createMixedSession(exam);s.answers.b={text:"",selected:[0]}
    const attempt=mixedAttempt(s), before=structuredClone(attempt)
    const result=prepareMixedRetry(attempt)
    expect(result.error).toBeNull();expect(result.exam).not.toBeNull()
    expect(result.exam!.title.length).toBeLessThanOrEqual(180)
    expect(result.exam!.questions.map(q=>q.id)).toEqual(["b"])
    expect(validateMixedContent({version:1,exams:[result.exam]})).toEqual([])
    const retry=createMixedSession(result.exam!);retry.answers.b={text:"",selected:[0]}
    const again=prepareMixedRetry(mixedAttempt(retry))
    expect(again.exam?.questions.map(q=>q.id)).toEqual(["b"])
    expect(again.exam?.title.match(/Incorrectas/g)).toHaveLength(1)
    expect(attempt).toEqual(before)
  })
  it("no falla silenciosamente con preguntas incompletas o intentos antiguos", () => {
    const s=createMixedSession(sampleExam());s.answers.b={text:"",selected:[0]}
    const attempt=mixedAttempt(s)
    const damaged=structuredClone(attempt)
    damaged.responses[1].mixedQuestion!.prompt=""
    expect(prepareMixedRetry(damaged).error).toContain("completá el enunciado")
    const legacy=structuredClone(attempt);delete legacy.responses[1].mixedQuestion
    expect(prepareMixedRetry(legacy).error).toContain("intento antiguo")
    const html=renderToStaticMarkup(<MixedExamsScreen initialRetry={damaged} onBack={()=>{}} onMainMenu={()=>{}}/>)
    expect(html).toContain('role="alert"');expect(html).toContain("No se pudo iniciar el repaso")
  })
  it("valida el contenido mixto antes de ejecutar una vista previa del Builder", () => {
    const project={app:"Odontoma Project" as const,version:1 as const,files:{library:{version:1,banks:[]},mixed:{version:1,exams:[sampleExam()]}}}
    expect(validatePreviewContent(project)).toEqual([])
    const q=project.files.mixed.exams[0].questions[0];if(q.kind!=="choice")throw Error()
    q.options[1]=q.options[0]
    expect(validatePreviewContent(project).join(" ")).toContain("opciones repetidas")
  })
  it("revela corrección de MC solo al comprobar y fija la selección al guardar/reanudar", () => {
    const exam = sampleExam(), key = mixedSessionKey(exam.id)
    let s = createMixedSession(exam)
    const q = s.exam.questions[0]; if(q.kind !== "choice")throw Error()
    const wrong = q.options.findIndex((_,i)=>!q.correctAnswers.includes(i))
    s = updateMixedAnswer(s,q.id,{text:"",selected:[wrong]})
    saveMixedSession(key,s)
    const render = () => renderToStaticMarkup(<MixedSessionScreen exam={exam} onBack={()=>{}} onChooseExams={()=>{}} onMainMenu={()=>{}} onRepeat={()=>{}} onRetry={()=>{}}/>)
    expect(render()).toContain("Comprobar")
    expect(render()).not.toContain("/media/back.png")
    expect(render()).not.toContain("Explicación de opciones")
    const checked = checkMixedAnswer(s,q.id)
    expect(checked.checkedQuestionIds).toEqual([q.id])
    expect(checkMixedAnswer(checked,q.id)).toBe(checked)
    expect(updateMixedAnswer(checked,q.id,{text:"",selected:q.correctAnswers})).toBe(checked)
    saveMixedSession(key,checked)
    expect(loadMixedSession(key,exam.id)).toEqual(checked)
    const html = render()
    expect(html).toContain("✕ Incorrecta")
    expect(html).toContain("Respuestas correctas")
    expect(html).toContain("Explicación de opciones")
    expect(html).toContain("/media/back.png")
    expect(mixedAttempt(loadMixedSession(key,exam.id)!).responses[0].grade).toBe("incorrect")
  })
  it("comprueba V/F pero no revela ni bloquea escritas antes de entregar; migra sesiones anteriores", () => {
    const exam=sampleExam(),key=mixedSessionKey(exam.id)
    let s=createMixedSession(exam)
    expect(checkMixedAnswer(s,"b")).toBe(s)
    s=updateMixedAnswer(s,"b",{text:"",selected:[1]})
    s=checkMixedAnswer(s,"b")
    expect(mixedAttempt(s).responses[1].grade).toBe("correct")
    s=updateMixedAnswer(s,"c",{text:"Mi respuesta",selected:[]})
    expect(checkMixedAnswer(s,"c")).toBe(s)
    expect(s.checkedQuestionIds).toEqual(["b"])
    const old = structuredClone(s) as Partial<typeof s>;delete old.checkedQuestionIds
    localStorage.setItem(key,JSON.stringify(old))
    expect(loadMixedSession(key,exam.id)?.checkedQuestionIds).toEqual([])
    expect(loadMixedSession(key,exam.id)?.answers.c.text).toBe("Mi respuesta")
    localStorage.setItem(key,JSON.stringify({...s,checkedQuestionIds:["c"]}))
    expect(loadMixedSession(key,exam.id)).toBeNull()
  })
  it("mezcla opciones conservando claves, sin modificar el original", () => {
    const e=sampleExam(), before=JSON.stringify(e)
    for(let n=0;n<20;n++){
      const s=createMixedSession(e), q=s.exam.questions[0]
      expect(s.exam.questions.map(q=>q.id)).toEqual(["a","b","c"])
      if(q.kind!=="choice")throw Error()
      expect(q.correctAnswers.map(i=>q.options[i]).sort()).toEqual(["Opción B","Opción D"])
    }
    e.shuffleQuestions=true
    expect(new Set(createMixedSession(e).exam.questions.map(q=>q.id)).size).toBe(3)
    e.shuffleQuestions=false; expect(JSON.stringify(e)).toBe(before)
  })
  it("corrige selección exacta y V/F; las escritas requieren evaluación explícita", () => {
    const [q,v,w]=sampleExam().questions
    expect(mixedGrade(q,{text:"",selected:[1]})).toBe("incorrect")
    expect(mixedGrade(q,{text:"",selected:[3,1]})).toBe("correct")
    expect(mixedGrade(v,{text:"",selected:[0]})).toBe("incorrect")
    expect(mixedGrade(v,{text:"",selected:[1]})).toBe("correct")
    expect(mixedGrade(w,{text:"Mi respuesta",selected:[]})).toBe("ungraded")
    expect(mixedGrade(w,{text:"Mi respuesta",selected:[]},"partial")).toBe("partial")
    expect(mixedGrade(w,{text:"  ",selected:[]},"correct")).toBe("unanswered")
  })
  it("restaura snapshot, claves, respuestas y fase incluso si cambia el banco", () => {
    const e=sampleExam(),s=createMixedSession(e),key=mixedSessionKey(e.id)
    s.phase="grading";s.current=2;s.answers.c={text:"Dos palabras",selected:[]};s.grades.c="partial"
    expect(saveMixedSession(key,s)).toBe(true)
    e.questions.reverse();e.questions[0].prompt="Contenido nuevo"
    expect(loadMixedSession(key,e.id)).toEqual(s)
    expect(loadMixedSession(key,"otro")).toBeNull()
    expect(clearMixedSession(key)).toBe(true);expect(loadMixedSession(key,e.id)).toBeNull()
    localStorage.setItem(key,'{"version":1,"exam":null}');expect(loadMixedSession(key,e.id)).toBeNull()
    s.answers.c={text:"x",selected:[99]};saveMixedSession(key,s);expect(loadMixedSession(key,e.id)).toBeNull()
  })
  it("mantiene puntuación, revisión escrita e incorrectas por intento con snapshots", () => {
    const s=createMixedSession(sampleExam())
    const choice=s.exam.questions[0];if(choice.kind!=="choice")throw Error()
    s.answers.a={text:"",selected:choice.correctAnswers};s.answers.b={text:"",selected:[0]};s.answers.c={text:"Mi texto",selected:[]};s.grades.c="partial"
    const attempt=mixedAttempt(s)
    expect(attempt.mode).toBe("mixed");expect(attempt.score).toBe(1.5);expect(attempt.total).toBe(3)
    const retry=retryMixedExam(attempt)!
    expect(retry.questions.map(q=>q.id)).toEqual(["b"]);expect(retry.id).not.toBe(s.exam.id)
    expect(attempt.responses[1].mixedQuestion).toEqual(s.exam.questions[1])
    const html=renderToStaticMarkup(<QuizReviewScreen attempt={attempt} onBack={()=>{}} onMainMenu={()=>{}}/>)
    expect(html).toContain("Respuesta modelo");expect(html).toContain("Explicación distinta");expect(html).toContain("written-answer.png");expect(html).toContain("También se considera correcto mencionar")
    expect(retryMixedExam({...attempt,responses:[]})).toBeNull()
  })
  it("conserva siete mixtos sin desplazar los siete escritos ni siete de opción múltiple", () => {
    const attempt=mixedAttempt(createMixedSession(sampleExam()))
    for(const mode of ["open-ended","multiple-choice","mixed"] as const)for(let n=0;n<9;n++)saveQuizAttempt({...attempt,id:`${mode}-${n}`,mode})
    const all=loadQuizHistory()
    expect(all).toHaveLength(21)
    for(const mode of ["open-ended","multiple-choice","mixed"])expect(all.filter(a=>a.mode===mode)).toHaveLength(7)
    expect(all[0].responses[0].mixedQuestion?.backImage).toBe("/media/back.png")
  })
})

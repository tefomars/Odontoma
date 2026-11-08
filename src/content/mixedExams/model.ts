export type MixedBase = {
  id: string; prompt: string; explanation?: string; image?: string; imageAlt?: string
  backImage?: string; backImageAlt?: string
}
export type MixedQuestion = MixedBase & (
  { kind: "choice"; options: string[]; correctAnswers: number[] } |
  { kind: "true-false"; correct: boolean } |
  { kind: "written"; modelAnswer: string; acceptedPoints: string[] }
)
export type MixedExam = {
  id: string; title: string; subject: string; category: string; description: string
  enabled: boolean; shuffleQuestions: boolean; questions: MixedQuestion[]
}
export type MixedContent = { version: 1; exams: MixedExam[] }
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v)
const text = (v: unknown, max: number, required = false) => typeof v === "string" && v.length <= max && (!required || !!v.trim())
const image = (v: unknown) => v === undefined || v === "" || (typeof v === "string" && /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/(src|assets|media)\/)/.test(v))
export function validateMixedContent(value: unknown): string[] {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.exams)) return ["Exámenes completos: se requiere version: 1 y exams: []."]
  const issues: string[] = [], exams = new Set<string>(), questions = new Set<string>()
  if (value.exams.length > 200) issues.push("Máximo 200 exámenes completos.")
  for (const [i, exam] of value.exams.entries()) {
    if (!object(exam)) { issues.push(`Examen ${i + 1}: datos inválidos.`); continue }
    const at = `Examen ${i + 1} (${typeof exam.title === "string" ? exam.title : "sin título"})`
    if (!text(exam.id, 150, true) || exams.has(String(exam.id))) issues.push(`${at}: ID vacío o repetido.`)
    exams.add(String(exam.id))
    if (!text(exam.title, 180, true) || !text(exam.subject, 120, true)) issues.push(`${at}: completá título y clase.`)
    if (!text(exam.category, 120) || !text(exam.description, 2000)) issues.push(`${at}: categoría o descripción inválida.`)
    if (typeof exam.enabled !== "boolean" || typeof exam.shuffleQuestions !== "boolean") issues.push(`${at}: visibilidad u orden inválido.`)
    if (!Array.isArray(exam.questions)) { issues.push(`${at}: falta questions: [].`); continue }
    if (exam.questions.length > 1000) issues.push(`${at}: máximo 1000 preguntas.`)
    for (const [j, q] of exam.questions.entries()) {
      const where = `${at} → pregunta ${j + 1}`
      if (!object(q)) { issues.push(`${where}: datos inválidos.`); continue }
      if (!text(q.id, 150, true) || questions.has(String(q.id))) issues.push(`${where}: ID vacío o repetido.`)
      questions.add(String(q.id))
      if (!text(q.prompt, 6000, true)) issues.push(`${where}: completá el enunciado (máximo 6000 caracteres).`)
      if (q.explanation !== undefined && !text(q.explanation, 12000)) issues.push(`${where}: explicación inválida.`)
      if (!image(q.image) || !image(q.backImage)) issues.push(`${where}: imagen inválida.`)
      if ((q.imageAlt !== undefined && !text(q.imageAlt, 1000)) || (q.backImageAlt !== undefined && !text(q.backImageAlt, 1000))) issues.push(`${where}: descripción de imagen inválida.`)
      if (q.kind === "choice") {
        if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8 || q.options.some(o => !text(o, 3000, true))) issues.push(`${where}: usá entre 2 y 8 opciones completas.`)
        else if (new Set(q.options.map(o => String(o).trim().toLocaleLowerCase())).size !== q.options.length) issues.push(`${where}: hay opciones repetidas.`)
        if (!Array.isArray(q.correctAnswers) || !q.correctAnswers.length || new Set(q.correctAnswers).size !== q.correctAnswers.length || q.correctAnswers.some(n => !Number.isInteger(n) || Number(n) < 0 || !Array.isArray(q.options) || Number(n) >= q.options.length)) issues.push(`${where}: elegí una o más respuestas correctas.`)
      } else if (q.kind === "true-false") {
        if (typeof q.correct !== "boolean") issues.push(`${where}: correct debe ser true o false.`)
      } else if (q.kind === "written") {
        if (!text(q.modelAnswer, 12000, true)) issues.push(`${where}: completá la respuesta modelo.`)
        if (!Array.isArray(q.acceptedPoints) || q.acceptedPoints.length > 100 || q.acceptedPoints.some(p => !text(p, 1000))) issues.push(`${where}: puntos aceptados inválidos.`)
      } else issues.push(`${where}: tipo desconocido; usá choice, true-false o written.`)
    }
  }
  return issues
}
export const mixedKindLabel = (kind: MixedQuestion["kind"]) => kind === "choice" ? "Opción múltiple" : kind === "true-false" ? "Verdadero / Falso" : "Respuesta escrita"
export function newMixedExam(): MixedExam {
  return { id: `mixed-${crypto.randomUUID()}`, title: "Nuevo examen", subject: "Nueva clase", category: "", description: "", enabled: false, shuffleQuestions: false, questions: [] }
}
export function newMixedQuestion(kind: MixedQuestion["kind"]): MixedQuestion {
  const base = { id: `mixed-q-${crypto.randomUUID()}`, prompt: "", explanation: "" }
  return kind === "choice" ? { ...base, kind, options: ["", "", "", ""], correctAnswers: [] } : kind === "true-false" ? { ...base, kind, correct: true } : { ...base, kind, modelAnswer: "", acceptedPoints: [] }
}
/** Import is additive and assigns new identities; exporting keeps stable IDs. */
export function importMixedExams(raw: string): MixedExam[] {
  const value = JSON.parse(raw)
  const content = value?.exams ? value : { version: 1, exams: [value] }
  const errors = validateMixedContent(content)
  if (errors.length) throw new Error(errors.slice(0, 8).join("\n"))
  return (content as MixedContent).exams.map(exam => ({ ...exam, id: `mixed-${crypto.randomUUID()}`, questions: exam.questions.map(q => ({ ...q, id: `mixed-q-${crypto.randomUUID()}` })) }))
}

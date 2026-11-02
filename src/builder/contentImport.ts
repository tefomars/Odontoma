import { detectDelimiter, parseDelimitedRows } from "../lib/delimitedText"
import type { ImportKind } from "./contentFormats"
const isSafeImage = (value: string) => /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/(src|assets|media)\/)/.test(value)

export type ImportedItem = { question?: string; options?: string[]; correctAnswers?: number[]; explanation?: string; difficulty?: string; front?: string; back?: string; prompt?: string; modelAnswer?: string; acceptedPoints?: string[]; topic?: string; subtopic?: string; image?: string; backImage?: string; imageAlt?: string; tags?: string[] }
export type ImportDocument = { records?: Record<string, unknown>[]; table?: string[][] }
export type ColumnMapping = Record<string, number>
export type ImportRow = { row: number; item?: ImportedItem; error?: string; duplicate?: boolean }
export const importKey = (text: string) => text.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ")
const key = (s: string) => importKey(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]/g, "")
export function readImport(text: string, kind: ImportKind): ImportDocument {
  const trimmed = text.replace(/^\uFEFF/, "").trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "")
  if (!trimmed) throw new Error("Pegá contenido o elegí un archivo.")
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const data = JSON.parse(trimmed)
    if (data.format === "odontoma-import" && data.version !== 1) throw new Error("Versión del formato no compatible. Usá la estructura versión 1 del builder.")
    if (data.type && ["multiple-choice", "true-false", "written", "flashcards"].includes(data.type) && !(kind === data.type || (kind === "multiple-choice" && data.type === "true-false"))) throw new Error("El tipo del archivo no corresponde al destino seleccionado.")
    const rows = Array.isArray(data) ? data : data.items || (kind === "flashcards" ? data.flashcards : data.questions)
    if (!Array.isArray(rows)) throw new Error("Usá un archivo de contenido con items, questions o flashcards. La restauración de proyectos completos está en Historial y backups.")
    if (rows.some(r => !r || typeof r !== "object" || Array.isArray(r))) throw new Error("Cada elemento JSON debe ser un objeto.")
    return { records: rows }
  }
  // Excel in Spanish often uses semicolons; quoted delimiters remain supported.
  return { table: parseDelimitedRows(trimmed, detectDelimiter(trimmed)) }
}
const aliases: Record<string, string[]> = { question: ["question", "pregunta", "prompt", "enunciado", "frente", "front", "afirmacion"], answer: ["answer", "respuesta", "correcta", "correctas", "respuestacorrecta", "modelanswer", "respuestamodelo", "back", "reverso"], explanation: ["explanation", "explicacion", "retroalimentacion"], acceptedPoints: ["acceptedpoints", "puntosaceptados", "alternativasaceptadas"], topic: ["topic", "tema"], subtopic: ["subtopic", "subtema"], image: ["image", "imagen"], backImage: ["backimage", "imagenrespuesta"], imageAlt: ["imagealt", "descripcionimagen"], difficulty: ["difficulty", "dificultad"], tags: ["tags", "etiquetas"] }
export function importFields(kind: ImportKind) {
  return [["question", kind === "flashcards" ? "Frente" : "Pregunta / afirmación"], ...(kind === "multiple-choice" ? Array.from({ length: 8 }, (_, i) => [String.fromCharCode(65 + i), `Opción ${String.fromCharCode(65 + i)}`]) : []), ["answer", kind === "flashcards" ? "Respuesta" : "Respuesta correcta / modelo"], ...(kind === "written" ? [["acceptedPoints", "Puntos aceptados"]] : []), ["explanation", "Explicación"], ["topic", "Tema"], ["subtopic", "Subtema"], ["image", "Imagen"], ["backImage", "Imagen de respuesta"], ["imageAlt", "Descripción de imagen"], ["difficulty", "Dificultad"], ["tags", "Etiquetas"]]
}
export function detectColumns(table: string[][], kind: ImportKind) {
  const header = table[0] || []
  const mapping: ColumnMapping = {}
  for (const [field] of importFields(kind)) mapping[field] = header.findIndex(h => (aliases[field] || [field.toLowerCase(), `opcion${field.toLowerCase()}`, `option${field.toLowerCase()}`]).includes(key(h)))
  const hasHeader = mapping.question >= 0 && mapping.answer >= 0
  if (!hasHeader) {
    const order = kind === "flashcards" ? ["question", "answer", "subtopic"] : kind === "written" ? ["question", "answer", "acceptedPoints", "explanation"] : kind === "true-false" ? ["question", "answer", "explanation"] : ["question", "A", "B", "C", "D", "answer", "explanation"]
    for (const field of Object.keys(mapping)) mapping[field] = order.indexOf(field)
  }
  return { mapping, hasHeader }
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : "" }
function list(value: unknown): string[] { return Array.isArray(value) ? value.map(text).filter(Boolean) : text(value).split("|").map(s => s.trim()).filter(Boolean) }
function answerIndexes(value: unknown, options: string[]): number[] {
  const answers = Array.isArray(value) ? value : String(value ?? "").split(/[|,;]/)
  return answers.map(v => {
    const s = String(v).trim()
    if (/^[a-h]$/i.test(s)) return s.toUpperCase().charCodeAt(0) - 65
    if (/^[1-8]$/.test(s)) return Number(s) - 1
    return options.findIndex(o => importKey(o) === importKey(s))
  })
}
function booleanAnswer(value: unknown) {
  if (value === true || ["true", "verdadero", "v"].includes(importKey(String(value)))) return 0
  if (value === false || ["false", "falso", "f"].includes(importKey(String(value)))) return 1
  throw new Error("La respuesta V/F debe ser true/false, Verdadero/Falso o V/F.")
}
export function analyzeImport(document: ImportDocument, kind: ImportKind, existing: string[], mapping?: ColumnMapping, header = false): ImportRow[] {
  const records = document.records || (document.table || []).slice(header ? 1 : 0).map(row => Object.fromEntries(Object.entries(mapping || {}).map(([f, i]) => [f, i >= 0 ? row[i] : undefined])))
  if (records.length > 10000) throw new Error("Importá como máximo 10,000 elementos por lote.")
  const seen = new Set(existing.map(importKey))
  return records.map((record, index) => {
    const row = index + (header ? 2 : 1)
    try {
      const question = text(record.question || record.prompt || record.front)
      if (!question) throw new Error("Falta la pregunta o el frente.")
      const item: ImportedItem = { topic: text(record.topic), subtopic: text(record.subtopic), image: text(record.image), backImage: text(record.backImage), imageAlt: text(record.imageAlt), tags: list(record.tags) }
      for (const f of ["image", "backImage"] as const) if (item[f] && !isSafeImage(item[f])) throw new Error("Imagen inválida: usá una URL HTTP(S), una imagen del proyecto o una imagen incrustada.")
      if (kind === "flashcards" || kind === "written") {
        const answer = text(record.answer || record.modelAnswer || record.back)
        if (!answer) throw new Error("Falta la respuesta.")
        if (kind === "flashcards") Object.assign(item, { front: question, back: answer })
        else {
          if (record.acceptedPoints !== undefined && typeof record.acceptedPoints !== "string" && (!Array.isArray(record.acceptedPoints) || record.acceptedPoints.some(v => typeof v !== "string"))) throw new Error("Los puntos aceptados deben ser textos separados por | o un arreglo de textos.")
          Object.assign(item, { prompt: question, modelAnswer: answer, acceptedPoints: list(record.acceptedPoints), explanation: text(record.explanation) })
        }
      } else {
        const isBoolean = kind === "true-false" || typeof record.answer === "boolean"
        const options = isBoolean ? ["Verdadero", "Falso"] : Array.isArray(record.options) ? record.options.map(text) : Array.from({ length: 8 }, (_, i) => text(record[String.fromCharCode(65 + i)])).filter((s, i, a) => s || a.slice(i + 1).some(Boolean))
        if (options.length < 2 || options.length > 8 || options.some(o => !o)) throw new Error("Se necesitan de 2 a 8 opciones no vacías.")
        if (new Set(options.map(importKey)).size !== options.length) throw new Error("Hay opciones repetidas.")
        const correctAnswers = Array.isArray(record.correctAnswers) ? record.correctAnswers : isBoolean ? [booleanAnswer(record.answer)] : answerIndexes(record.answer, options)
        if (!correctAnswers.length || correctAnswers.some(n => !Number.isInteger(n) || Number(n) < 0 || Number(n) >= options.length) || new Set(correctAnswers).size !== correctAnswers.length) throw new Error("La respuesta correcta no coincide con las opciones. Usá A–H o 1–8; correctAnswers heredado usa índices desde 0.")
        const difficulty = { facil: "easy", media: "medium", dificil: "hard" }[key(text(record.difficulty))] || text(record.difficulty) || "medium"
        if (!["easy", "medium", "hard"].includes(difficulty)) throw new Error("Dificultad: easy, medium o hard.")
        Object.assign(item, { question, options, correctAnswers, difficulty, explanation: text(record.explanation) })
      }
      const duplicate = seen.has(importKey(question))
      seen.add(importKey(question))
      return { row, item, duplicate }
    } catch (e) { return { row, error: e instanceof Error ? e.message : String(e) } }
  })
}

import type { OpenQuizContent } from "./types.ts"

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)
const text = (value: unknown, max: number, required = false) => typeof value === "string" && value.length <= max && (!required || !!value.trim())
const optionalText = (value: unknown, max: number) => value === undefined || text(value, max)
const color = (value: unknown) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
const image = (value: unknown) => value === undefined || value === "" || (typeof value === "string" && /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/(src|assets|media)\/)/.test(value))

/** Shared by local save, project restore and the editor. Never changes content. */
export function validateWrittenContent(value: unknown): string[] {
  const issues: string[] = []
  if (!object(value) || !Array.isArray(value.decks)) return ["Escritas: falta la lista de cuestionarios."]
  if (value.decks.length > 200) issues.push("Escritas: máximo 200 cuestionarios.")
  if (value.classes !== undefined && !Array.isArray(value.classes)) return ["Escritas: la lista de clases no es válida."]
  const classes = Array.isArray(value.classes) ? value.classes : []
  if (classes.length > 100) issues.push("Escritas: máximo 100 clases.")
  const classIds = new Set<string>(), classNames = new Set<string>()
  for (const [index, item] of classes.entries()) {
    const where = `Clase ${index + 1}`
    if (!object(item)) { issues.push(`${where}: datos inválidos.`); continue }
    const name = typeof item.name === "string" ? item.name.trim().toLocaleLowerCase() : ""
    if (!text(item.id, 150, true) || classIds.has(String(item.id))) issues.push(`${where}: identificador vacío o repetido.`)
    if (!text(item.name, 120, true) || classNames.has(name)) issues.push(`${where}: nombre vacío, repetido o mayor de 120 caracteres.`)
    if (!text(item.symbol, 12, true)) issues.push(`${where}: falta el símbolo o supera 12 caracteres.`)
    if (!color(item.color)) issues.push(`${where}: el color debe tener formato #RRGGBB.`)
    classIds.add(String(item.id)); classNames.add(name)
  }
  const deckIds = new Set<string>(), questionIds = new Set<string>()
  for (const [index, deck] of value.decks.entries()) {
    if (!object(deck)) { issues.push(`Cuestionario ${index + 1}: datos inválidos.`); continue }
    const where = `${typeof deck.subject === "string" ? deck.subject : "Escritas"} → ${typeof deck.title === "string" && deck.title.trim() ? deck.title : `Cuestionario ${index + 1}`}`
    if (!text(deck.id, 150, true) || deckIds.has(String(deck.id))) issues.push(`${where}: identificador de cuestionario vacío o repetido.`)
    deckIds.add(String(deck.id))
    if (!text(deck.title, 180, true)) issues.push(`${where}: falta el título o supera 180 caracteres.`)
    if (!text(deck.subject, 120, true)) issues.push(`${where}: falta la clase o supera 120 caracteres.`)
    if (deck.partial !== undefined && deck.partial !== null && (!Number.isInteger(deck.partial) || Number(deck.partial) < 1 || Number(deck.partial) > 9)) issues.push(`${where}: elegí un parcial entre 1 y 9, o Sin parcial.`)
    if (deck.color !== undefined && !color(deck.color)) issues.push(`${where}: color del cuestionario inválido.`)
    if (!optionalText(deck.classSymbol, 12)) issues.push(`${where}: símbolo de clase inválido.`)
    if (deck.classColor !== undefined && !color(deck.classColor)) issues.push(`${where}: color de clase inválido.`)
    if (!optionalText(deck.description, 800)) issues.push(`${where}: la descripción supera 800 caracteres o no es texto.`)
    if (!Array.isArray(deck.questions)) { issues.push(`${where}: falta la lista de preguntas.`); continue }
    if (deck.questions.length > 2000) issues.push(`${where}: máximo 2000 preguntas por cuestionario.`)
    for (const [questionIndex, question] of deck.questions.entries()) {
      const at = `${where} → Pregunta ${questionIndex + 1}`
      if (!object(question)) { issues.push(`${at}: datos inválidos.`); continue }
      if (!text(question.id, 150, true) || questionIds.has(String(question.id))) issues.push(`${at}: identificador de pregunta vacío o repetido.`)
      questionIds.add(String(question.id))
      if (!text(question.prompt, 3000, true)) issues.push(`${at}: falta el enunciado o supera 3000 caracteres.`)
      if (!text(question.modelAnswer, 12000, true)) issues.push(`${at}: falta la respuesta modelo o supera 12000 caracteres.`)
      if (!Array.isArray(question.acceptedPoints) || question.acceptedPoints.some(point => !text(point, 1000)) || question.acceptedPoints.filter(point => typeof point === "string" && point.trim()).length > 100) issues.push(`${at}: los puntos aceptados deben ser hasta 100 textos de máximo 1000 caracteres.`)
      if (!optionalText(question.explanation, 12000)) issues.push(`${at}: la explicación supera 12000 caracteres o no es texto.`)
      if (!optionalText(question.source, 1000)) issues.push(`${at}: la fuente supera 1000 caracteres o no es texto.`)
      if (!image(question.image)) issues.push(`${at}: Imagen de la pregunta inválida. Subí JPG/PNG/WebP/GIF o usá una URL HTTP(S).`)
      if (!image(question.backImage)) issues.push(`${at}: Imagen de la respuesta inválida. Subí JPG/PNG/WebP/GIF o usá una URL HTTP(S).`)
      if (!optionalText(question.imageAlt, 1000)) issues.push(`${at}: la descripción de imagen de pregunta supera 1000 caracteres.`)
      if (!optionalText(question.backImageAlt, 1000)) issues.push(`${at}: la descripción de imagen de respuesta supera 1000 caracteres.`)
    }
  }
  return issues
}

/** Blank lines are editing space, not answer criteria. Keep them while typing;
 * remove them only from the saved copy, without changing questions or answers. */
export function normalizeWrittenForSave(content: OpenQuizContent): OpenQuizContent {
  return { ...content, decks: content.decks.map(deck => ({ ...deck, questions: deck.questions.map(question => ({
    ...question, acceptedPoints: question.acceptedPoints.map(point => point.trim()).filter(Boolean)
  })) })) }
}

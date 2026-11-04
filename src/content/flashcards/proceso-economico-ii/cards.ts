import type { Flashcard } from "../histologia/cards"
import { parseDelimitedRows } from "@/lib/delimitedText"
import source from "./raw/proceso_economico_ii.tsv?raw"
import { polishCardCopy } from "./copyEdits"

// Keep the original Anki export alongside the editable cards. Presentation and
// wording are lightly cleaned up; five cloze notes become questions. The class
// content is preserved rather than replaced with a different economics syllabus.
export function ankiPlainText(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:div|p|li|ol|ul|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

const clozeQuestions: Record<string, { front: string; back: string }> = {
  "K7H+J1=,uI": {
    front: "¿Qué propiedad permite usar una mercancía como medio para alcanzar otros fines de forma mediata?",
    back: "La liquidez de la mercancía.",
  },
  "mpc--27h_(": {
    front: "¿Qué siete características debe tener el dinero según Mises?",
    back: "• Aceptabilidad\n• Escasez\n• Transportable\n• Homogéneo\n• Divisible\n• Durable\n• Difícil de falsificar",
  },
  "Ho?4+A8&VG": {
    front: "¿Qué ocurre con la ley y la justicia cuando no existe un poder común?",
    back: "No hay ley y, por tanto, no hay justicia.",
  },
  "mnRi|=9Ax1": {
    front: "¿El Estado y el gobierno son fines o medios?",
    back: "Son medios, no fines.",
  },
  "vm^SE|uKW0": {
    front: "¿Dónde y para quién busca producir el mercantilismo?",
    back: "Dentro del país, para el país.",
  },
}

const subtopicTitles: Record<string, string> = {
  "De Proceso I": "Repaso de Proceso I",
  "Naturaleza y origen del dinero": "Naturaleza y origen del dinero",
  "La oferta del dinero I": "Banca comercial y oferta de dinero",
  "La oferta del dinero II": "Banca central y política monetaria",
  "Inflación": "Inflación",
  "Agregados Macroeconómicos": "Agregados macroeconómicos y ciclos",
  "Macroeconomía": "Macroeconomía general",
  "El Estado": "El Estado y sus funciones",
  "Ingresos": "Ingresos públicos e impuestos",
  "Mercantilismo": "Mercantilismo e intervención",
  "Sector Externo": "Sector externo y comercio internacional",
  "Propiedad Privada": "Propiedad privada",
  "Socialismo": "Socialismo",
}

const rows = parseDelimitedRows(source.split("\n").filter(line => !line.startsWith("#")).join("\n"), "\t")

const procesoEconomicoIIFlashcards: Flashcard[] = rows.map(([guid, noteType, deck, question, answer, tags]) => {
  const path = deck.split("::").slice(3)
  const chapter = path[0] === "Segundo Parcial" ? "Parcial 2" : path[0] === "Z-Final" ? "Final" : "Parcial 1"
  // Two banking cards were exported at the course root; keep them with banking,
  // not in an unexplained fourth "General" chapter.
  const rawSubtopic = path.at(-1) || "La oferta del dinero I"
  const subtopic = subtopicTitles[rawSubtopic] || rawSubtopic
  const adapted = clozeQuestions[guid]
  if (noteType !== "Básico+" && !adapted) throw new Error(`Falta adaptar la tarjeta Anki ${guid}`)
  const { front, back } = polishCardCopy(guid, { front: adapted?.front || ankiPlainText(question), back: adapted?.back || ankiPlainText(answer) })
  if (!front || !back) throw new Error(`Tarjeta de Proceso Económico II incompleta: ${guid}`)
  // GUID-derived IDs stay stable if the source file is reordered or extended.
  const id = `proceso-economico-ii-${Array.from(guid, char => char.codePointAt(0)!.toString(16).padStart(2, "0")).join("")}`
  return {
    id,
    subject: "Proceso Económico II",
    book: "Material de clase",
    chapter,
    topic: path[1] || "Intercambio directo e indirecto",
    subtopic,
    front,
    back,
    tags: ["proceso-economico-ii", chapter === "Final" ? "final" : chapter === "Parcial 2" ? "parcial-2" : "parcial-1", ...(tags?.split(/\s+/).filter(Boolean) || [])],
  }
})

export default procesoEconomicoIIFlashcards

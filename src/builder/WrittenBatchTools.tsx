import type { OpenQuizDeck, OpenQuizQuestion } from "@/content/openQuizzes"
import ImportPanel from "./ImportPanel"
import { downloadText } from "./ImportGuide"
import { serializeDelimitedRows } from "@/lib/delimitedText"

export default function WrittenBatchTools({ deck, onChange }: { deck: OpenQuizDeck; onChange: (questions: OpenQuizQuestion[]) => void }) {
  return <details><summary>Importar, exportar y formato para AI</summary><ImportPanel key={deck.id} kind="written" destination={deck.title} existing={deck.questions.map(q => q.prompt)} onConfirm={rows => onChange([...deck.questions, ...rows.map(q => ({ id: `open-${crypto.randomUUID()}`, prompt: q.prompt!, modelAnswer: q.modelAnswer!, acceptedPoints: q.acceptedPoints || [], explanation: q.explanation || "", image: q.image, imageAlt: q.imageAlt, backImage: q.backImage, backImageAlt: q.backImageAlt }))])}/><button onClick={() => downloadText(JSON.stringify(deck, null, 2), `${deck.title}.json`, "application/json")}>Exportar JSON</button><button onClick={() => downloadText(serializeDelimitedRows([["Pregunta", "Respuesta modelo", "Puntos aceptados", "Explicación", "image", "imageAlt", "backImage", "backImageAlt"], ...deck.questions.map(q => [q.prompt, q.modelAnswer, q.acceptedPoints.join("|"), q.explanation || "", q.image || "", q.imageAlt || "", q.backImage || "", q.backImageAlt || ""])], "\t"), `${deck.title}.tsv`)}>Exportar TSV</button></details>
}

import { useState } from "react"
import { aiPrompt, formatExample, formatNames, type ImportKind } from "./contentFormats"
import { serializeDelimitedRows } from "../lib/delimitedText"
import { workspaceNavigate } from "./workspaceBridge"

export function downloadText(value: string, name: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([value], { type }))
  const a = document.createElement("a"); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export default function ImportGuide({ initialKind = "multiple-choice" }: { initialKind?: ImportKind }) {
  const [kind, setKind] = useState<ImportKind>(initialKind)
  const [status, setStatus] = useState("")
  const example = JSON.stringify(formatExample(kind), null, 2)
  const prompt = aiPrompt(kind)
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setStatus("Copiado. Podés pegarlo en cualquier AI o editor.") } catch { setStatus("No se pudo copiar automáticamente. Seleccioná el texto de abajo y copialo.") } }
  function csv() {
    const rows = kind === "flashcards" ? [["Frente", "Respuesta", "Subtema"], ["¿Qué estructura conecta X con Y?", "Respuesta breve.", "Subtema"]]
      : kind === "written" ? [["Pregunta", "Respuesta modelo", "Puntos aceptados", "Explicación", "image", "imageAlt", "backImage", "backImageAlt"], ["¿Qué función cumple X?", "Respuesta modelo.", "Concepto 1|Concepto 2", "Explicación adicional.", "", "", "", ""]]
      : kind === "true-false" ? [["Afirmación", "Correcta", "Explicación"], ["Afirmación para evaluar.", "Falso", "Justificación."]]
      : [["Pregunta", "A", "B", "C", "D", "Correcta", "Explicación"], ["¿Cuál describe X?", "Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D", "B", "Justificación."]]
    downloadText("\uFEFF" + serializeDelimitedRows(rows, ","), `odontoma-${kind}-plantilla.csv`, "text/csv;charset=utf-8")
  }
  return <section className="studio-import-guide"><h2>Formatos y prompts para cualquier AI</h2><button onClick={() => workspaceNavigate({ panel: "mixed" })}>Examen completo mixto: formato, prompt e importación →</button><p>No necesitás una AI específica ni conectar cuentas. Copiá el prompt, pegá tu material en la AI que prefirás y traé su JSON al importador. El builder valida la estructura; la exactitud académica se revisa aparte.</p><label>Tipo de contenido<select value={kind} onChange={e => { setKind(e.target.value as ImportKind); setStatus("") }}>{Object.entries(formatNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><div className="studio-context-links"><button onClick={() => void copy(prompt)}>Copiar prompt para AI</button><button onClick={() => void copy(example)}>Copiar estructura JSON</button><button onClick={() => downloadText(example, `odontoma-${kind}-ejemplo.json`, "application/json")}>Descargar ejemplo JSON</button><button onClick={csv}>Descargar plantilla Excel / CSV</button></div><p role="status">{status}</p><p>Elegís materia y capítulo al importar. Los IDs se asignan automáticamente: importar agrega contenido nuevo y no reemplaza tus preguntas ni el progreso. En JSON, answer usa letras A–H o números 1–8; para varias correctas, un arreglo. En V/F usa true o false. Imágenes opcionales: URL o imagen incrustada.</p><details><summary>Ver estructura JSON</summary><textarea aria-label="Estructura JSON para importar" rows={14} readOnly value={example}/></details><details><summary>Ver prompt completo</summary><textarea aria-label="Prompt para cualquier AI" rows={16} readOnly value={prompt}/></details></section>
}

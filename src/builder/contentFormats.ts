export type ImportKind = "multiple-choice" | "true-false" | "written" | "flashcards"
export const formatNames: Record<ImportKind, string> = { "multiple-choice": "Opción múltiple", "true-false": "Verdadero / Falso", written: "Respuestas escritas", flashcards: "Flashcards" }
export function formatExample(kind: ImportKind) {
  const common = { topic: "Tema o sección", image: "", imageAlt: "" }
  const item = kind === "flashcards" ? { front: "¿Qué estructura conecta X con Y?", back: "Respuesta concreta y breve.", subtopic: "Subtema", ...common, backImage: "", tags: [] }
    : kind === "written" ? { question: "¿Qué función cumple X?", answer: "Respuesta modelo.", acceptedPoints: ["Concepto aceptado", "Otro concepto aceptado"], explanation: "Explicación adicional, separada de la respuesta.", ...common }
    : kind === "true-false" ? { question: "Afirmación que el estudiante debe evaluar.", answer: false, explanation: "Por qué es falsa y cómo se corrige.", ...common }
    : { question: "¿Cuál de estas alternativas describe X?", options: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"], answer: "B", explanation: "Justificación breve.", difficulty: "medium", ...common }
  return { format: "odontoma-import", version: 1, type: kind, items: [item] }
}
export function aiPrompt(kind: ImportKind) {
  const criteria = kind === "flashcards"
    ? "Usá preguntas naturales y específicas, con una sola tarea de recuerdo y respuestas concisas. Separá conceptos complejos en tarjetas pequeñas, agrupadas por topic/subtopic. Evitá enunciados vagos como «mencione cosas correctas», preguntas V/F y el patrón repetitivo «En X, ¿qué es Y?». Cubrí conceptos importantes y detalles examinables sin duplicar tarjetas."
    : kind === "written" ? "Formulá preguntas claras de definiciones, relaciones y mecanismos presentes en el material. Separá answer (respuesta modelo), acceptedPoints (frases o conceptos alternativos aceptados) y explanation (retroalimentación). No pongás explicaciones dentro de la respuesta modelo si no son parte de lo preguntado."
    : kind === "true-false" ? "Creá afirmaciones precisas, algunas verdaderas y algunas falsas con cambios sutiles pero inequívocos. No uses ambigüedades ni trampas de redacción. answer debe ser un booleano true o false, no texto. Explicá la corrección de cada afirmación falsa."
    : "Creá alternativas personalizadas y plausibles para cada pregunta, de longitud y complejidad equivalentes. No revelés la correcta con detalles extra, su longitud o porque las demás sean de otra categoría. Debe haber una única respuesta inequívoca. Podés usar 2–8 alternativas; answer usa letras A–H. Para selección múltiple, usá un arreglo de letras y explicitá que hay varias respuestas."
  return `Generá contenido de estudio para Odontoma usando EXCLUSIVAMENTE el material que pegaré después. No inventés datos, imágenes ni URLs. Si algo no está respaldado o es ambiguo, no lo conviertas en pregunta. No escribas «según los apuntes» ni referencias a la fuente en las preguntas.

Tipo: ${formatNames[kind]}.
${criteria}

Entregá SOLO JSON válido, sin comentarios ni bloques Markdown, con esta estructura exacta. Reemplazá el ejemplo por todos los elementos necesarios. No generés IDs, bancos, capítulos ni datos de progreso: elegiré el destino en el builder. image, backImage e imageAlt son opcionales; dejalos vacíos si no hay imágenes proporcionadas.
${JSON.stringify(formatExample(kind), null, 2)}

MATERIAL:
[Pegá aquí el texto y especificá la cantidad o cobertura deseada]`
}

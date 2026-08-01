const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const rawDirectory = path.join(
  projectRoot,
  "src/content/flashcards/histologia/raw"
)
const sourcePaths = [
  path.join(rawDirectory, "cap13.tsv"),
  path.join(rawDirectory, "cap13-details.tsv")
]
const identificationPath = path.join(
  rawDirectory,
  "cap13-identification.tsv"
)
const outputPath = path.join(
  projectRoot,
  "src/content/flashcards/histologia/cap13.ts"
)

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const lines = sourcePaths.flatMap(sourcePath =>
  fs
    .readFileSync(sourcePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
)

const identificationLines = fs
  .readFileSync(identificationPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(1)

const structuresWithReverseCard = new Set()

for (const line of identificationLines) {
  const [subtopic, structure, clue] = line.split("\t")

  if (!subtopic || !structure || !clue) {
    throw new Error(`Fila de identificación inválida: ${line}`)
  }

  lines.push(
    `Capítulo 13\t${subtopic}\t¿Qué estructura cardiovascular se identifica por este rasgo: ${clue}?\t${structure}.`
  )

  if (!structuresWithReverseCard.has(structure)) {
    lines.push(
      `Capítulo 13\t${subtopic}\t¿Qué rasgo histológico ayuda a identificar ${structure}?\t${clue}.`
    )
    structuresWithReverseCard.add(structure)
  }
}

const cards = lines.map((line, index) => {
  const [chapter, subtopic, front, back] = line.split("\t")

  if (!chapter || !subtopic || !front || !back) {
    throw new Error(`Fila inválida ${index + 2}: ${line}`)
  }

  return {
    id: `histo-cap13-${slugify(subtopic)}-${String(index + 1).padStart(4, "0")}`,
    subject: "Histología",
    book: "Ross",
    chapter,
    topic: "Sistema cardiovascular",
    subtopic,
    front,
    back,
    tags: ["Capítulo 13", subtopic]
  }
})

const output = `import type { Flashcard } from "./cards"\n\nexport const cap13Flashcards: Flashcard[] = ${JSON.stringify(cards, null, 2)}\n`

fs.writeFileSync(outputPath, output)
console.log(`Capítulo 13: ${cards.length} flashcards generadas`)

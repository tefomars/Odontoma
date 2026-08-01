const fs = require("fs")
const path = require("path")

const root = process.cwd()
const rawDirectory = path.join(root, "src/content/flashcards/histologia/raw")
const sourcePaths = ["cap14.tsv", "cap14-details.tsv"].map(file =>
  path.join(rawDirectory, file)
)
const identificationPath = path.join(rawDirectory, "cap14-identification.tsv")
const outputPath = path.join(root, "src/content/flashcards/histologia/cap14.ts")

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const lines = sourcePaths.flatMap(sourcePath =>
  fs.readFileSync(sourcePath, "utf8").split(/\r?\n/).filter(Boolean).slice(1)
)

const identificationLines = fs
  .readFileSync(identificationPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(1)

const reverseStructures = new Set()

for (const line of identificationLines) {
  const [subtopic, structure, clue] = line.split("\t")

  if (!subtopic || !structure || !clue) {
    throw new Error(`Fila de identificación inválida: ${line}`)
  }

  lines.push(`Capítulo 14\t${subtopic}\t¿Qué estructura se identifica por este rasgo: ${clue}?\t${structure}.`)

  if (!reverseStructures.has(structure)) {
    lines.push(`Capítulo 14\t${subtopic}\t¿Qué rasgo ayuda a identificar ${structure}?\t${clue}.`)
    reverseStructures.add(structure)
  }
}

const cards = lines.map((line, index) => {
  const [chapter, subtopic, front, back] = line.split("\t")

  if (!chapter || !subtopic || !front || !back) {
    throw new Error(`Fila inválida ${index + 2}: ${line}`)
  }

  return {
    id: `histo-cap14-${slugify(subtopic)}-${String(index + 1).padStart(4, "0")}`,
    subject: "Histología",
    book: "Ross",
    chapter,
    topic: "Sistema inmunitario y tejidos y órganos linfáticos",
    subtopic,
    front,
    back,
    tags: ["Capítulo 14", subtopic]
  }
})

const output = `import type { Flashcard } from "./cards"\n\nexport const cap14Flashcards: Flashcard[] = ${JSON.stringify(cards, null, 2)}\n`

fs.writeFileSync(outputPath, output)
console.log(`Capítulo 14: ${cards.length} flashcards generadas`)

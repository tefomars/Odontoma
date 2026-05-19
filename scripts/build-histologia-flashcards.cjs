const fs = require("fs")
const path = require("path")

const baseDir = path.join(
  process.cwd(),
  "src/content/flashcards/histologia"
)

const rawDir = path.join(baseDir, "raw")

const chapters = [
  {
    chapterNumber: 4,
    filename: "cap4.tsv",
    exportName: "cap4Flashcards",
    output: "cap4.ts",
    topic: "Fundamentos de los tejidos"
  },
  {
    chapterNumber: 5,
    filename: "cap5.tsv",
    exportName: "cap5Flashcards",
    output: "cap5.ts",
    topic: "Tejido epitelial"
  }
]

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseTsv(content) {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.toLowerCase().startsWith("chapter\tsubtopic\tfront\tback"))
    .map(line => {
      const parts = line.split("\t")

      if (parts.length < 4) return null

      const [chapter, subtopic, front, ...backParts] = parts

      const back = backParts.join("\t")

      if (!chapter || !subtopic || !front || !back) return null

      return {
        chapter: chapter.trim(),
        subtopic: subtopic.trim(),
        front: front.trim(),
        back: back.trim()
      }
    })
    .filter(Boolean)
}

function buildChapterFile(config) {
  const rawPath = path.join(rawDir, config.filename)

  if (!fs.existsSync(rawPath)) {
    throw new Error(`No existe ${rawPath}`)
  }

  const raw = fs.readFileSync(rawPath, "utf8")
  const rows = parseTsv(raw)

  const cards = rows.map((row, index) => {
    const number = String(index + 1).padStart(4, "0")

    return {
      id: `histo-cap${config.chapterNumber}-${slugify(row.subtopic)}-${number}`,
      subject: "Histología",
      book: "Ross",
      chapter: row.chapter,
      topic: config.topic,
      subtopic: row.subtopic,
      front: row.front,
      back: row.back,
      tags: [
        `cap${config.chapterNumber}`,
        slugify(row.subtopic)
      ]
    }
  })

  const output = `import type { Flashcard } from "./cards"

export const ${config.exportName}: Flashcard[] = ${JSON.stringify(cards, null, 2)}
`

  fs.writeFileSync(
    path.join(baseDir, config.output),
    output
  )

  return cards.length
}

const counts = chapters.map(config => ({
  ...config,
  count: buildChapterFile(config)
}))

const cardsTs = `import {
  cap4Flashcards
} from "./cap4"

import {
  cap5Flashcards
} from "./cap5"

export type Flashcard = {
  id: string
  subject: string
  book: string
  chapter: string
  topic: string
  subtopic: string
  front: string
  back: string
  tags: string[]
}

export const histologiaFlashcards: Flashcard[] = [
  ...cap4Flashcards,
  ...cap5Flashcards
]
`

fs.writeFileSync(
  path.join(baseDir, "cards.ts"),
  cardsTs
)

console.log("Flashcards generadas:")
for (const item of counts) {
  console.log(`Capítulo ${item.chapterNumber}: ${item.count}`)
}

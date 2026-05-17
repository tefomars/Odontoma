const fs = require("fs")
const path = require("path")

const root = path.join(
  process.cwd(),
  "src/content/histologia"
)

function walk(dir) {
  let files = []

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) {
      files = files.concat(walk(full))
    } else if (item.endsWith(".ts")) {
      files.push(full)
    }
  }

  return files
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

const files = walk(root)

const idMap = new Map()
const questionMap = new Map()
const optionSetMap = new Map()

let totalObjects = 0

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8")

  const objects =
    raw.match(/\{\s*id:\s*"[^"]+"[\s\S]*?\n\s*\}/g) || []

  for (const obj of objects) {
    totalObjects++

    const id =
      obj.match(/id:\s*"([^"]+)"/)?.[1]

    const question =
      obj.match(/question:\s*\n\s*"([\s\S]*?)"/)?.[1]

    const optionsBlock =
      obj.match(/options:\s*$begin:math:display$\(\[\\s\\S\]\*\?\)$end:math:display$/)?.[1]

    const options =
      optionsBlock
        ? [...optionsBlock.matchAll(/"([\s\S]*?)"/g)].map(m => m[1])
        : []

    if (id) {
      if (!idMap.has(id)) idMap.set(id, [])
      idMap.get(id).push(file)
    }

    if (question) {
      const key = normalize(question)

      if (!questionMap.has(key)) questionMap.set(key, [])
      questionMap.get(key).push({
        id,
        question,
        file
      })
    }

    if (options.length) {
      const key =
        options
          .map(normalize)
          .sort()
          .join(" | ")

      if (!optionSetMap.has(key)) optionSetMap.set(key, [])
      optionSetMap.get(key).push({
        id,
        question,
        file
      })
    }
  }
}

function printGroup(title, map) {
  console.log("\n" + title)
  console.log("-".repeat(title.length))

  let found = false

  for (const items of map.values()) {
    if (items.length > 1) {
      found = true

      console.log("\nPossible duplicate:")

      for (const item of items) {
        if (typeof item === "string") {
          console.log(" -", path.relative(process.cwd(), item))
        } else {
          console.log(" -", item.id, ":", item.question)
          console.log("   ", path.relative(process.cwd(), item.file))
        }
      }
    }
  }

  if (!found) {
    console.log("No exact duplicates found.")
  }
}

console.log("Question audit")
console.log("==============")
console.log("Files scanned:", files.length)
console.log("Question objects detected:", totalObjects)

printGroup("Duplicate IDs", idMap)
printGroup("Exact duplicate question text", questionMap)
printGroup("Identical option sets", optionSetMap)

console.log("\nDone.")

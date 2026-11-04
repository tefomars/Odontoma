import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { parseGitLog, mergeCommitHistory } from "./changelog-history.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))
const target = new URL("../src/content/changelog/commits.json", import.meta.url)
const before = readFileSync(target, "utf8")
const saved = JSON.parse(before)
if (!Array.isArray(saved)) throw new Error("El historial automático debe ser una lista; no se sobrescribió nada.")
let current = []
try {
  current = parseGitLog(execFileSync("git", ["log", "--no-merges", "--max-count=50", "--format=%H%x00%cI%x00%s%x00%b%x00"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }))
} catch { console.warn("Changelog: Git no disponible; se conserva el historial y se usa metadata de la publicación si existe.") }
const entries = mergeCommitHistory(saved, current, process.env)
const next = JSON.stringify(entries, null, 2) + "\n"
if (next !== before) writeFileSync(target, next)
console.log(`Changelog: ${entries.length} cambios automáticos disponibles. Las ediciones manuales se conservaron.`)

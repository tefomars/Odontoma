/** Commit notes only: never publish author emails, diffs, credentials or paths. */
export function parseGitLog(output) {
  const fields = output.split("\0")
  const entries = []
  for (let i = 0; i + 3 < fields.length; i += 4) {
    const [rawHash, date, title, body] = fields.slice(i, i + 4)
    const hash = rawHash.trim()
    if (!/^[a-f0-9]{40,64}$/i.test(hash) || !title.trim() || !Number.isFinite(Date.parse(date))) continue
    entries.push({ id: `git-${hash}`, date: new Date(date).toISOString(), title: title.trim().slice(0, 300), body: body.trim().slice(0, 12000) })
  }
  return entries
}

export function mergeCommitHistory(saved, current, env = {}, now = new Date().toISOString()) {
  const entries = new Map()
  for (const entry of [...saved, ...current]) {
    if (entry && /^git-[a-f0-9]{40,64}$/i.test(entry.id) && typeof entry.title === "string" && typeof entry.body === "string" && Number.isFinite(Date.parse(entry.date))) entries.set(entry.id, entry)
  }
  // Some deployment checkouts have no .git directory. Vercel's build metadata
  // still supplies the deployed commit's SHA/message. Cached history survives.
  const hash = env.VERCEL_GIT_COMMIT_SHA
  const message = env.VERCEL_GIT_COMMIT_MESSAGE?.trim()
  if (/^[a-f0-9]{40,64}$/i.test(hash || "") && message && !entries.has(`git-${hash}`)) {
    const [title, ...body] = message.split(/\r?\n/)
    entries.set(`git-${hash}`, { id: `git-${hash}`, date: now, title: title.slice(0, 300), body: body.join("\n").trim().slice(0, 12000) })
  }
  return [...entries.values()].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, 100)
}

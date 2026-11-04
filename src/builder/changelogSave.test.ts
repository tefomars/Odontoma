import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { Readable } from "node:stream"
import { afterEach, describe, expect, it } from "vitest"
import { studioServer } from "./studioServer"
import { contentRevision } from "./librarySafety"
import { validChangelog } from "@/content/changelog/model"
import organization from "@/content/appBuilder/organization.json"

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "odontoma-changelog-save-")); roots.push(root)
  const files = {
    library: ["src/content/studio/data.json", { version: 1, banks: [] }],
    written: ["src/content/openQuizzes/data.json", { classes: [], decks: [] }],
    home: ["src/content/appBuilder/subjects.json", { mainMenu: { cards: [{ id: "backup", destination: "custom-page:backup-options" }] }, quizMenu: { cards: [] }, subjects: [] }],
    decks: ["src/content/appBuilder/flashcard-subjects.json", []], pages: ["src/content/appBuilder/custom-pages.json", [{ id: "backup-options", title: "Opciones", blocks: [{ id: "backup", type: "button", destination: "backup" }, { id: "appearance", type: "button", destination: "appearance" }, { id: "changelog", type: "button", destination: "changelog" }] }]],
    overrides: ["src/content/appBuilder/ui-overrides.json", []], theme: ["src/builder/applied-theme.json", {}],
    organization: ["src/content/appBuilder/organization.json", organization],
    changelog: ["src/content/changelog/data.json", { version: 1, appVersion: "0.10.0", title: "Cambios", description: "", entries: [] }],
  } as const
  for (const [file, value] of Object.values(files)) { await mkdir(path.dirname(path.join(root, file)), { recursive: true }); await writeFile(path.join(root, file), JSON.stringify(value)) }
  let middleware: any
  const plugin = studioServer({ home: () => true, decks: () => true, pages: () => true, overrides: () => true, theme: () => true, changelog: validChangelog })
  const configure = plugin.configureServer as (server: any) => void
  configure({ config: { root }, middlewares: { use: (fn: any) => { middleware = fn } }, ssrLoadModule: async () => ({ resolveStudioBanks: (data: any) => data.banks, compactStudioData: (data: any) => data }) })
  const request = async (url: string, method = "GET", body?: any) => {
    const req: any = Readable.from(body ? [JSON.stringify(body)] : [])
    Object.assign(req, { url, method, socket: { remoteAddress: "127.0.0.1" }, headers: {} })
    let output = ""
    const res = { statusCode: 200, setHeader: () => {}, end: (text: string) => { output = text } }
    await middleware(req, res, () => {})
    return { status: res.statusCode, output }
  }
  const project = async () => JSON.parse((await request("/__odontoma-studio/project")).output)
  const save = async (value: any) => request("/__odontoma-studio/project", "POST", { ...value, expectedRevision: value.revision, libraryBaseRevision: await contentRevision({ version: 1, banks: [] }) })
  return { root, request, project, save }
}

describe("changelog in full project saves and backups", () => {
  it("saves notes through the normal guarded project workflow and includes them in backup", async () => {
    const app = await fixture()
    const before = await app.project()
    before.files.changelog.appVersion = "0.10.3"
    before.files.changelog.entries = [{ id: "manual-1", title: "Nuevo quiz", body: "Con explicaciones", date: "2026-11-04" }]
    expect((await app.save(before)).status).toBe(200)
    expect((await app.project()).files.changelog).toEqual(before.files.changelog)
    expect(JSON.parse((await app.request("/__odontoma-studio/changelog")).output)).toEqual(before.files.changelog)
    expect(JSON.parse(await readFile(path.join(app.root, "src/content/openQuizzes/data.json"), "utf8"))).toEqual(before.files.written)
  })
  it("rejects invalid notes before writing unrelated project files", async () => {
    const app = await fixture()
    const before = await app.project()
    const invalid = structuredClone(before)
    invalid.files.changelog.entries = [{ id: "x", title: "", body: "", date: "bad" }]
    const result = await app.save(invalid)
    expect(result.status).toBe(400)
    expect(result.output).toContain("Backup inválido en changelog")
    expect(await app.project()).toEqual(before)
  })
  it("restores an old backup without deleting changelog notes added after that backup format", async () => {
    const app = await fixture()
    const current = await app.project()
    const legacy = structuredClone(current)
    delete legacy.files.changelog
    legacy.restore = true
    expect((await app.save(legacy)).status).toBe(200)
    expect((await app.project()).files.changelog).toEqual(current.files.changelog)
  })
  it("preserves the selected release when restoring notes from before the version field existed", async () => {
    const app = await fixture()
    const current = await app.project()
    current.files.changelog.appVersion = "1.2.3"
    expect((await app.save(current)).status).toBe(200)
    const legacy = await app.project()
    delete legacy.files.changelog.appVersion
    legacy.restore = true
    expect((await app.save(legacy)).status).toBe(200)
    expect((await app.project()).files.changelog.appVersion).toBe("1.2.3")
  })
  it("blocks invalid release numbers without changing notes or academic content", async () => {
    const app = await fixture()
    const current = await app.project()
    const invalid = structuredClone(current)
    invalid.files.changelog.appVersion = "nueva versión"
    expect((await app.save(invalid)).status).toBe(400)
    expect(await app.project()).toEqual(current)
  })
})

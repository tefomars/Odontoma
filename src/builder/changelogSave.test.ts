import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { Readable } from "node:stream"
import { afterEach, describe, expect, it } from "vitest"
import { studioServer } from "./studioServer"
import { contentRevision } from "./librarySafety"
import { validChangelog } from "@/content/changelog/model"
import organization from "@/content/appBuilder/organization.json"
import { moveWrittenDeck } from "@/content/openQuizzes/categories"
import { newMixedExam } from "@/content/mixedExams/model"

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "odontoma-changelog-save-")); roots.push(root)
  const files = {
    mixed: ["src/content/mixedExams/data.json", { version: 1, exams: [] }],
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

describe("mixed exams in guarded project save and restore", () => {
  it("saves types, order and images, includes them in backups and restores them", async () => {
    const app = await fixture(), before = await app.project()
    const exam = { ...newMixedExam(), title:"Mi examen", subject:"Clase", enabled:true, questions:[
      {id:"w1",kind:"written",prompt:"Pregunta",modelAnswer:"Respuesta",acceptedPoints:["Dos palabras"],backImage:"/media/answer.png"},
      {id:"v1",kind:"true-false",prompt:"Afirmación",correct:false},
      {id:"c1",kind:"choice",prompt:"Elegí",options:["A","B"],correctAnswers:[1]}
    ] }
    before.files.mixed={version:1,exams:[exam]}
    expect((await app.save(before)).status).toBe(200)
    const saved=await app.project()
    expect(saved.files.mixed).toEqual(before.files.mixed)
    expect(JSON.parse((await app.request("/__odontoma-studio/mixed")).output)).toEqual(before.files.mixed)
    expect(saved.files.written).toEqual(before.files.written)
    const next=structuredClone(saved);next.files.mixed.exams[0].questions.reverse()
    expect((await app.save(next)).status).toBe(200)
    const names=JSON.parse((await app.request("/__odontoma-studio/project-revisions")).output)
    const snapshot=JSON.parse((await app.request(`/__odontoma-studio/project-revisions/${names[0]}`)).output)
    expect(snapshot.files.mixed).toEqual(saved.files.mixed)
    snapshot.restore=true;snapshot.revision=(await app.project()).revision
    expect((await app.save(snapshot)).status).toBe(200)
    expect((await app.project()).files.mixed).toEqual(saved.files.mixed)
  })
  it("rejects malformed keys without changing any other file and preserves mixed data in legacy restores", async () => {
    const app=await fixture(), before=await app.project()
    before.files.mixed={version:1,exams:[newMixedExam()]}
    expect((await app.save(before)).status).toBe(200)
    const saved=await app.project(), invalid=structuredClone(saved)
    invalid.files.mixed.exams[0].questions=[{id:"x",kind:"true-false",prompt:"Afirmación",correct:"false"}]
    expect((await app.save(invalid)).status).toBe(400)
    expect(await app.project()).toEqual(saved)
    const old=structuredClone(saved);delete old.files.mixed;old.restore=true
    expect((await app.save(old)).status).toBe(200)
    expect((await app.project()).files.mixed).toEqual(saved.files.mixed)
  })
})

describe("written categories through full project save and restore", () => {
  it("persists category and exam order, backs them up, and restores without editing questions", async () => {
    const app = await fixture()
    const start = await app.project()
    start.files.written = {
      classes: [{ id: "materials", name: "Materiales", symbol: "X", color: "#123456", categories: [{ id: "y2", name: "Año 2" }, { id: "p12", name: "Parcial 12" }] }],
      decks: ["A", "B"].map(id => ({ id, title: id, subject: "Materiales", categoryId: "p12", questions: [{ id: `q-${id}`, prompt: "Pregunta original", modelAnswer: "Respuesta original", explanation: "Explicación original", acceptedPoints: ["Dos palabras"], image: "/media/q.png", backImage: "/media/a.png" }] }))
    }
    expect((await app.save(start)).status).toBe(200)
    const before = await app.project()
    const next = structuredClone(before)
    next.files.written = moveWrittenDeck(next.files.written, "B", -1)
    next.files.written.classes[0].categories.reverse()
    expect((await app.save(next)).status).toBe(200)
    expect((await app.project()).files.written).toEqual(next.files.written)
    const names = JSON.parse((await app.request("/__odontoma-studio/project-revisions")).output)
    const snapshot = JSON.parse((await app.request(`/__odontoma-studio/project-revisions/${names[0]}`)).output)
    expect(snapshot.files.written).toEqual(before.files.written)
    snapshot.restore = true; snapshot.revision = (await app.project()).revision
    expect((await app.save(snapshot)).status).toBe(200)
    expect((await app.project()).files.written).toEqual(before.files.written)
  })
  it("rejects invalid category references before any file changes", async () => {
    const app = await fixture()
    const current = await app.project()
    const invalid = structuredClone(current)
    invalid.files.written = { classes: [], decks: [{ id: "A", title: "Quiz", subject: "Clase", categoryId: "missing", questions: [] }] }
    const response = await app.save(invalid)
    expect(response.status).toBe(400)
    expect(response.output).toContain("la categoría no existe")
    expect(await app.project()).toEqual(current)
  })
})

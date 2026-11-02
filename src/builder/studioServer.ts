import type { Plugin, ViteDevServer } from "vite"
import { validateNavigation, type NavigationProject } from "../content/appBuilder/navigationValidation.ts"
import { promises as fs } from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"
import { validateStudio } from "../content/studio/schema.ts"
import { validateOrganization } from "../content/appBuilder/organizationSchema.ts"
import { registerNewCourseCards } from "../content/studio/menuRegistration.ts"
import { describeChanges, projectCounts, historyDate, type ProjectSnapshot } from "./projectHistory.ts"
import { renderBuilderCss, type BuilderTheme } from "./theme.ts"

function assertNavigation(project: NavigationProject) {
  const errors = validateNavigation(project).filter(i => i.severity === "error")
  if (errors.length) throw new Error(errors.map(i => i.message).join("\n"))
}
// Legacy editor saves receive the same link checks as the global save.
export async function validateStoredNavigation(server: ViteDevServer, area: "home" | "decks" | "pages", value: unknown) {
  const read = async (file: string) => JSON.parse(await fs.readFile(path.join(server.config.root, file), "utf8"))
  const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
  const project = { home: await read("src/content/appBuilder/subjects.json"), decks: await read("src/content/appBuilder/flashcard-subjects.json"), pages: await read("src/content/appBuilder/custom-pages.json"), banks: catalog.resolveStudioBanks(await read("src/content/studio/data.json")), [area]: value }
  assertNavigation(project)
}

export function studioServer(validators: Record<string, (value: unknown) => boolean> = {}): Plugin {
  return { name: "odontoma-private-studio", apply: "serve", configureServer(server) {
    const root = server.config.root
    const contentPath = path.join(root, "src/content/studio/data.json")
    const historyPath = path.join(root, ".odontoma-history")
    const files = { library: "src/content/studio/data.json", written: "src/content/openQuizzes/data.json", home: "src/content/appBuilder/subjects.json", decks: "src/content/appBuilder/flashcard-subjects.json", pages: "src/content/appBuilder/custom-pages.json", overrides: "src/content/appBuilder/ui-overrides.json", theme: "src/builder/applied-theme.json", organization: "src/content/appBuilder/organization.json" }
    async function project() { return { app: "Odontoma Project", version: 1, files: Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, file]) => [key, JSON.parse(await fs.readFile(path.join(root, file), "utf8"))]))) } }
    let snapshotTime = 0
    async function snapshot(value: ProjectSnapshot, label = "Antes de aplicar cambios", kind = "automatic") {
      snapshotTime = Math.max(Date.now(), snapshotTime + 1)
      const name = `project-${new Date(snapshotTime).toISOString().replaceAll(":", "_")}.json`
      await fs.mkdir(historyPath, { recursive: true })
      await fs.writeFile(path.join(historyPath, name), JSON.stringify(value))
      await fs.writeFile(path.join(historyPath, name + ".meta"), JSON.stringify({ label, kind }))
      return name
    }
    server.middlewares.use(async (req, res, next) => {
      const route = req.url?.split("?")[0]
      if (!route?.startsWith("/__odontoma-studio/") && !(route?.startsWith("/__odontoma-builder/") && req.method === "POST")) return next()
      const local = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress || "")
      let origin: boolean
      try { origin = !req.headers.origin || ["localhost", "127.0.0.1", "[::1]"].includes(new URL(req.headers.origin).hostname) } catch { origin = false }
      if (!local || !origin) { res.statusCode = 403; res.end("Solo disponible en tu computadora."); return }
      res.setHeader("Cache-Control", "no-store")
      req.setEncoding("utf8")
      try {
        if (route.startsWith("/__odontoma-builder/") && req.method === "POST") {
          await snapshot(await project() as ProjectSnapshot); next(); return
        }
        if (route === "/__odontoma-studio/project" && req.method === "GET") { res.setHeader("Content-Type", "application/json"); res.setHeader("Content-Disposition", 'attachment; filename="odontoma-proyecto-editable.json"'); res.end(JSON.stringify(await project())); return }
        if (route === "/__odontoma-studio/project" && req.method === "POST") {
          let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 40_000_000) throw new Error("Backup demasiado grande") }
          const value = JSON.parse(body)
          if (value.app !== "Odontoma Project" || value.version !== 1 || !value.files) throw new Error("No es un backup de proyecto Odontoma.")
          if (!value.files.organization) value.files.organization = (await project()).files.organization
          if (Array.isArray(value.files.library?.banks)) for (const bank of value.files.library.banks) for (const chapter of bank.chapters || []) if (chapter.image?.startsWith("/src/")) chapter.image = "@legacy"
          const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
          const library = { version: 1, banks: catalog.resolveStudioBanks(value.files.library) }
          const previous = await project()
          const beforeBanks = catalog.resolveStudioBanks(previous.files.library)
          const menus = value.restore ? { home: value.files.home, decks: value.files.decks } : registerNewCourseCards(value.files.home, value.files.decks, new Set(beforeBanks.map((b: { id: string }) => b.id)), library.banks)
          value.files.home = menus.home; value.files.decks = menus.decks
          for (const key of Object.keys(files)) if (key === "library" ? validateStudio(library).length > 0 : !(key === "organization" ? validateOrganization(value.files[key]) : validators[key]?.(value.files[key]))) throw new Error(`Backup inválido en ${key}`)
          assertNavigation({ home: value.files.home, decks: value.files.decks, pages: value.files.pages, banks: library.banks })
          value.files.library = catalog.compactStudioData(library)
          await snapshot(previous as ProjectSnapshot, value.saveLabel ? `Antes de guardar: ${String(value.saveLabel).slice(0, 120)}` : "Antes de guardar o restaurar")
          try { for (const [key, file] of Object.entries(files)) { await fs.writeFile(path.join(root, `${file}.tmp`), JSON.stringify(value.files[key], null, 2) + "\n"); await fs.rename(path.join(root, `${file}.tmp`), path.join(root, file)) }; await fs.writeFile(path.join(root, "src/builder/applied-theme.css"), renderBuilderCss(value.files.theme as BuilderTheme)) }
          catch (error) { for (const [key, file] of Object.entries(files)) await fs.writeFile(path.join(root, file), JSON.stringify(previous.files[key], null, 2) + "\n"); await fs.writeFile(path.join(root, "src/builder/applied-theme.css"), renderBuilderCss(previous.files.theme as BuilderTheme)); throw error }
          res.end(JSON.stringify({ ok: true })); return
        }
        if (route === "/__odontoma-studio/organization" && req.method === "GET") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify((await project()).files.organization)); return }
        if (route === "/__odontoma-studio/organization" && req.method === "POST") {
          let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 500000) throw new Error("Organización demasiado grande") }
          const value = JSON.parse(body); if (!validateOrganization(value)) throw new Error("Revisá nombres, identificadores y colores de las subdivisiones.")
          await snapshot(await project() as ProjectSnapshot, "Antes de cambiar subdivisiones")
          await fs.writeFile(path.join(root, files.organization), JSON.stringify(value, null, 2) + "\n")
          res.end(JSON.stringify({ ok: true })); return
        }
        if (route === "/__odontoma-studio/checkpoint" && req.method === "POST") {
          let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 5000) throw new Error("Nombre demasiado largo") }
          const value = JSON.parse(body)
          const name = await snapshot(await project() as ProjectSnapshot, String(value.label || "Punto de recuperación").slice(0, 150), value.publication ? "publication" : "checkpoint")
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ ok: true, name })); return
        }
        if (route === "/__odontoma-studio/history" && req.method === "GET") {
          await fs.mkdir(historyPath, { recursive: true })
          const names = (await fs.readdir(historyPath)).filter(n => /^project-[0-9T_.Z-]+\.json$/.test(n)).sort().reverse().slice(0, 50)
          const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
          const expand = (p: ProjectSnapshot): ProjectSnapshot => ({ ...p, files: { ...p.files, library: { version: 1, banks: catalog.resolveStudioBanks(p.files.library) } } })
          const current = expand(await project() as ProjectSnapshot)
          const result = await Promise.all(names.map(async name => {
            const p = expand(JSON.parse(await fs.readFile(path.join(historyPath, name), "utf8")))
            let meta = { label: "Copia automática · antes de aplicar cambios", kind: "automatic" }
            try { meta = JSON.parse(await fs.readFile(path.join(historyPath, name + ".meta"), "utf8")) } catch { /* Older snapshots have no metadata. */ }
            return { name, createdAt: historyDate(name), ...meta, counts: projectCounts(p), changes: describeChanges(p, current) }
          }))
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(result)); return
        }
        if (route === "/__odontoma-studio/project-revisions" && req.method === "GET") { await fs.mkdir(historyPath, { recursive: true }); res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify((await fs.readdir(historyPath)).filter(n => /^project-[0-9T_.Z-]+\.json$/.test(n)).sort().reverse())); return }
        if (route.startsWith("/__odontoma-studio/project-revisions/") && req.method === "GET") { const name = route.slice("/__odontoma-studio/project-revisions/".length); if (!/^project-[0-9T_.Z-]+\.json$/.test(name)) throw new Error("Versión inválida"); res.setHeader("Content-Type", "application/json"); res.end(await fs.readFile(path.join(historyPath, name))); return }
        if (route === "/__odontoma-studio/backup" && req.method === "GET") {
          res.setHeader("Content-Type", "application/gzip")
          res.setHeader("Content-Disposition", `attachment; filename="odontoma-proyecto-${new Date().toISOString().slice(0,10)}.tar.gz"`)
          const child = spawn("tar", ["--exclude=./node_modules", "--exclude=./dist", "--exclude=./.vercel", "--exclude=./.env", "--exclude=./.env.*", "--exclude=./.odontoma-history", "-czf", "-", "-C", root, "."])
          child.stdout.pipe(res); child.on("error", () => res.destroy()); res.on("close", () => { if (!res.writableEnded && !child.killed) child.kill() }); return
        }
        if (route === "/__odontoma-studio/catalog" && req.method === "GET") {
          const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ version: 1, banks: catalog.resolveStudioBanks(JSON.parse(await fs.readFile(contentPath, "utf8"))) })); return
        }
        if (route === "/__odontoma-studio/revisions" && req.method === "GET") {
          await fs.mkdir(historyPath, { recursive: true })
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify((await fs.readdir(historyPath)).filter(n => /^[0-9].*\.json$/.test(n)).sort().reverse())); return
        }
        if (route?.startsWith("/__odontoma-studio/revisions/") && req.method === "GET") {
          const name = route.slice("/__odontoma-studio/revisions/".length)
          if (!/^[0-9T_.Z-]+\.json$/.test(name)) throw new Error("Versión inválida")
          const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ version: 1, banks: catalog.resolveStudioBanks(JSON.parse(await fs.readFile(path.join(historyPath, name), "utf8"))) })); return
        }
        if (route === "/__odontoma-studio/catalog" && req.method === "POST") {
          let body = ""
          for await (const chunk of req) { body += chunk; if (body.length > 40_000_000) throw new Error("La biblioteca supera el tamaño permitido.") }
          const data = JSON.parse(body)
          const issues = validateStudio(data)
          if (issues.length) throw new Error(issues.slice(0,8).join("\n"))
          // Imported asset URLs are supplied by Vite at runtime; retain their original imports.
          for (const bank of data.banks) for (const chapter of bank.chapters) if (chapter.image?.startsWith("/src/")) chapter.image = "@legacy"
          await fs.mkdir(historyPath, { recursive: true })
          await snapshot(await project() as ProjectSnapshot, "Antes de guardar biblioteca")
          await fs.copyFile(contentPath, path.join(historyPath, `${new Date().toISOString().replaceAll(":", "_")}.json`))
          const catalog = await server.ssrLoadModule("/src/content/studio/catalog.ts")
          const previous = await project()
          const beforeBanks = catalog.resolveStudioBanks(previous.files.library)
          const menus = registerNewCourseCards(previous.files.home as import("../content/appBuilder/types").HomeContent, previous.files.decks as import("../content/appBuilder/types").FlashcardSubjectBlock[], new Set(beforeBanks.map((b: { id: string }) => b.id)), data.banks)
          if (!validators.home?.(menus.home) || !validators.decks?.(menus.decks)) throw new Error("Los menús no pueden registrar más materias. Revisá sus tarjetas.")
          assertNavigation({ ...menus, pages: previous.files.pages as NavigationProject["pages"], banks: catalog.resolveStudioBanks(catalog.compactStudioData(data)) })
          const updates = [[contentPath, catalog.compactStudioData(data)], [path.join(root, files.home), menus.home], [path.join(root, files.decks), menus.decks]] as const
          try {
            for (const [file, value] of updates) await fs.writeFile(`${file}.tmp`, JSON.stringify(value, null, 2) + "\n")
            for (const [file] of updates) await fs.rename(`${file}.tmp`, file)
          } catch (error) {
            for (const [file, value] of [[contentPath, previous.files.library], [path.join(root, files.home), previous.files.home], [path.join(root, files.decks), previous.files.decks]] as const) await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n")
            throw error
          }
          res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ ok: true })); return
        }
        res.statusCode = 405; res.end("Operación no disponible")
      } catch (error) { res.statusCode = 400; res.end(error instanceof Error ? error.message : "No se pudo guardar") }
    })
  } }
}

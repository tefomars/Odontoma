import { defineConfig } from "vite"
import { studioServer, validateStoredNavigation } from "./src/builder/studioServer.ts"

import react from "@vitejs/plugin-react"

import tailwindcss from "@tailwindcss/vite"

import path from "path"

import { promises as fs } from "node:fs"

import type { Plugin } from "vite"

import { renderBuilderCss, type BuilderTheme } from "./src/builder/theme.ts"
import { validateUiOverrides } from "./src/content/appBuilder/uiOverrideSchema.ts"
import { validateCustomPages } from "./src/content/appBuilder/customPageSchema.ts"
import { validChangelog } from "./src/content/changelog/model.ts"
import { validateWrittenContent, normalizeWrittenForSave } from "./src/content/openQuizzes/validation.ts"

type OpenQuizQuestion = {
  image?: string
  imageAlt?: string
  backImage?: string
  backImageAlt?: string
  id: string
  prompt: string
  modelAnswer: string
  acceptedPoints: string[]
  explanation?: string
  source?: string
}

type OpenQuizDeck = {
  id: string
  title: string
  subject: string
  partial?: number | null
  color?: string
  classSymbol?: string
  classColor?: string
  description?: string
  questions: OpenQuizQuestion[]
}

type OpenQuizClass = {
  id: string
  name: string
  symbol: string
  color: string
}

type OpenQuizContent = {
  classes?: OpenQuizClass[]
  decks: OpenQuizDeck[]
}

type HomeSubject = {
  hidden?: boolean
  image?: string
  sectionId?: string
  id: string
  title: string
  subtitle: string
  status: string
  accentColor: string
  destination:
    | "histologia"
    | "filosofia-de-hayek"
    | "microbiologia"
    | "bioquimica"
    | "semiologia"
    | "open-quizzes"
    | "coming-soon"
}

type HomeContent = {
  mainMenu: {
    eyebrow: string
    title: string
    cards: AppMenuCard[]
  }
  quizMenu: {
    eyebrow: string
    title: string
    subtitle: string
    toolsLabel: string
    cards: AppMenuCard[]
  }
  subjects: HomeSubject[]
}

type AppMenuCard = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  symbol: string
  accentColor: string
  destination?: string
  section?: "main" | "tools"
}

type FlashcardSubjectBlock = {
  hidden?: boolean
  image?: string
  sectionId?: string
  id: string
  title: string
  subtitle: string
  description: string
  accent: string
  accentColor: string
  destination:
    | "histologia"
    | "proceso-economico-i"
    | "filosofia-de-hayek"
    | "semiologia"
    | "bioquimica"
    | "coming-soon"
}

const builderThemePath = path.resolve(
  import.meta.dirname,
  "./src/builder/applied-theme.json"
)

const builderCssPath = path.resolve(
  import.meta.dirname,
  "./src/builder/applied-theme.css"
)

const openQuizContentPath = path.resolve(
  import.meta.dirname,
  "./src/content/openQuizzes/data.json"
)

const homeContentPath = path.resolve(
  import.meta.dirname,
  "./src/content/appBuilder/subjects.json"
)

const uiOverridesPath = path.resolve(
  import.meta.dirname,
  "./src/content/appBuilder/ui-overrides.json"
)

const flashcardSubjectsPath = path.resolve(
  import.meta.dirname,
  "./src/content/appBuilder/flashcard-subjects.json"
)

const customPagesPath = path.resolve(
  import.meta.dirname,
  "./src/content/appBuilder/custom-pages.json"
)

function isLoopback(address?: string) {
  return address === "127.0.0.1" ||
    address === "::1" ||
    address === "::ffff:127.0.0.1"
}

function isLocalOrigin(origin?: string) {
  if (!origin) return true

  try {
    const hostname = new URL(origin).hostname
    return hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
  } catch {
    return false
  }
}

function validImage(value: unknown) {
  return value === undefined || (typeof value === "string" && /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/(src|assets|media)\/|$)/.test(value))
}

function validColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
}

function validNumber(
  value: unknown,
  minimum: number,
  maximum: number
) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
}

function validateTheme(value: unknown): value is BuilderTheme {
  if (!value || typeof value !== "object") return false

  const theme = value as Partial<BuilderTheme>

  return typeof theme.enabled === "boolean" &&
    validColor(theme.primaryBackground) &&
    validColor(theme.primaryForeground) &&
    validColor(theme.primaryBorder) &&
    validColor(theme.outlineBackground) &&
    validColor(theme.outlineForeground) &&
    validColor(theme.outlineBorder) &&
    validNumber(theme.borderWidth, 0, 8) &&
    validNumber(theme.radius, 0, 40) &&
    validNumber(theme.shadow, 0, 40) &&
    validNumber(theme.fontWeight, 400, 900) &&
    validColor(theme.focusColor) &&
    validNumber(theme.focusWidth, 1, 8)
}

function validText(
  value: unknown,
  maximum: number,
  required = false
): value is string {
  return typeof value === "string" &&
    value.length <= maximum &&
    (!required || value.trim().length > 0)
}

function validateOpenQuizContent(value: unknown): value is OpenQuizContent {
  return validateWrittenContent(value).length === 0
}

function validateHomeContent(value: unknown): value is HomeContent {
  if (!value || typeof value !== "object") return false

  const content = value as Partial<HomeContent>
  const destinations = new Set([
    "histologia",
    "filosofia-de-hayek",
    "microbiologia",
    "bioquimica",
    "semiologia",
    "open-quizzes",
    "coming-soon"
  ])

  if (
    !content.mainMenu ||
    !content.quizMenu ||
    !validText(content.mainMenu.eyebrow, 80, true) ||
    !validText(content.mainMenu.title, 180, true) ||
    !validText(content.quizMenu.eyebrow, 80, true) ||
    !validText(content.quizMenu.title, 180, true) ||
    !validText(content.quizMenu.subtitle, 800, true) ||
    !validText(content.quizMenu.toolsLabel, 120, true) ||
    !Array.isArray(content.mainMenu.cards) ||
    !Array.isArray(content.quizMenu.cards) ||
    !Array.isArray(content.subjects) ||
    content.subjects.length > 100
  ) {
    return false
  }

  const menuDestinations = new Set([
    "home",
    "quizzes",
    "flashcards",
    "multiple-choice",
    "open-ended",
    "my-quizzes",
    "history",
    "backup",
    "appearance",
    "changelog",
    "pre-partial",
    "coming-soon"
  ])
  const validMenuDestination = (destination?: string) => destination === undefined ||
    menuDestinations.has(destination) || /^(custom-page|bank|flashcard-bank):[a-z0-9][a-z0-9-]{0,149}$/i.test(destination)
  const validCards = (cards: AppMenuCard[]) => cards.length <= 100 &&
    cards.every(card =>
      validText(card.id, 80, true) &&
      validText(card.eyebrow, 80, true) &&
      validText(card.title, 180, true) &&
      validText(card.subtitle, 800, true) &&
      validText(card.symbol, 20, true) &&
      validColor(card.accentColor) &&
      validMenuDestination(card.destination) &&
      (card.section === undefined || card.section === "main" || card.section === "tools")
    )

  if (
    !validCards(content.mainMenu.cards) ||
    !validCards(content.quizMenu.cards)
  ) {
    return false
  }

  const ids = new Set<string>()

  return content.subjects.every(subject => {
    if (
      !subject ||
      !validText(subject.id, 150, true) ||
      ids.has(subject.id) ||
      !validText(subject.title, 180, true) ||
      !validText(subject.subtitle, 800) ||
      !validText(subject.status, 80, true) ||
      !validColor(subject.accentColor) ||
      !validImage(subject.image) ||
      (subject.hidden !== undefined && typeof subject.hidden !== "boolean") ||
      (subject.sectionId !== undefined && !validText(subject.sectionId, 150, true)) ||
      !(destinations.has(subject.destination) || /^(custom-page|bank):[a-z0-9][a-z0-9-]{0,149}$/i.test(subject.destination))
    ) {
      return false
    }

    ids.add(subject.id)
    return true
  })
}

function validateFlashcardSubjects(value: unknown): value is FlashcardSubjectBlock[] {
  if (!Array.isArray(value) || value.length > 100) return false
  const ids = new Set<string>()
  const destinations = new Set([
    "histologia",
    "proceso-economico-i",
    "filosofia-de-hayek",
    "semiologia",
    "bioquimica",
    "coming-soon"
  ])
  return value.every(subject => {
    if (!subject ||
      !validText(subject.id, 150, true) || ids.has(subject.id) ||
      !validText(subject.title, 180, true) ||
      !validText(subject.subtitle, 120, true) ||
      !validText(subject.description, 800, true) ||
      !validText(subject.accent, 120, true) ||
      !validColor(subject.accentColor) ||
      !(destinations.has(subject.destination) || /^(custom-page|bank):[a-z0-9][a-z0-9-]{0,149}$/i.test(subject.destination))
    ) return false
    ids.add(subject.id)
    return true
  })
}

function localBuilderPlugin(): Plugin {
  return {
    name: "odontoma-local-builder",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(
          request.url || "/",
          "http://localhost"
        ).pathname

        if (
          pathname !== "/builder.html" &&
          pathname !== "/builder-preview.html" &&
          pathname !== "/builder-draft.html" &&
          pathname !== "/__odontoma-builder/theme" &&
          pathname !== "/__odontoma-builder/open-quizzes" &&
          pathname !== "/__odontoma-builder/home-content" &&
          pathname !== "/__odontoma-builder/flashcard-subjects" &&
          pathname !== "/__odontoma-builder/custom-pages" &&
          pathname !== "/__odontoma-builder/ui-overrides"
        ) {
          next()
          return
        }

        if (!isLoopback(request.socket.remoteAddress)) {
          response.statusCode = 403
          response.end("El editor visual solo está disponible en esta máquina.")
          return
        }

        if (!isLocalOrigin(request.headers.origin)) {
          response.statusCode = 403
          response.end("Origen no autorizado")
          return
        }

        if (pathname === "/builder.html" || pathname === "/builder-preview.html" || pathname === "/builder-draft.html") {
          next()
          return
        }

        if (request.method === "GET") {
          response.setHeader("Cache-Control", "no-store")
          response.setHeader("Content-Type", "application/json")
          if (pathname === "/__odontoma-builder/home-content") {
            const value = JSON.parse(await fs.readFile(homeContentPath, "utf8"))
            response.end(JSON.stringify(value)); return
          }
          if (pathname === "/__odontoma-builder/flashcard-subjects") {
            const value = JSON.parse(await fs.readFile(flashcardSubjectsPath, "utf8"))
            response.end(JSON.stringify(value)); return
          }
          response.end(
            await fs.readFile(
              pathname === "/__odontoma-builder/open-quizzes"
                ? openQuizContentPath
                : pathname === "/__odontoma-builder/custom-pages"
                      ? customPagesPath
                  : pathname === "/__odontoma-builder/ui-overrides"
                    ? uiOverridesPath
                  : builderThemePath,
              "utf8"
            )
          )
          return
        }

        if (request.method !== "POST") {
          response.statusCode = 405
          response.end("Método no permitido")
          return
        }

        request.setEncoding("utf8")
        let body = ""

        request.on("data", chunk => {
          body += chunk

          const maximumBodyLength =
            pathname === "/__odontoma-builder/open-quizzes" ||
            pathname === "/__odontoma-builder/home-content" ||
            pathname === "/__odontoma-builder/flashcard-subjects" ||
            pathname === "/__odontoma-builder/custom-pages" ||
            pathname === "/__odontoma-builder/ui-overrides"
              ? 40_000_000
              : 20_000

          if (body.length > maximumBodyLength) {
            request.destroy()
          }
        })

        request.on("end", async () => {
          try {
            const value: unknown = JSON.parse(body)

            if (pathname === "/__odontoma-builder/open-quizzes") {
              if (!validateOpenQuizContent(value)) {
                response.statusCode = 400
                response.end(validateWrittenContent(value).slice(0, 12).join("\n"))
                return
              }

              await fs.writeFile(
                openQuizContentPath,
                `${JSON.stringify(normalizeWrittenForSave(value), null, 2)}\n`
              )

              response.setHeader("Content-Type", "application/json")
              response.end(JSON.stringify({ ok: true }))
              return
            }

            if (pathname === "/__odontoma-builder/home-content") {
              if (!validateHomeContent(value)) {
                response.statusCode = 400
                response.end("Contenido de inicio inválido")
                return
              }

              await validateStoredNavigation(server, "home", value)
              await fs.writeFile(
                homeContentPath,
                `${JSON.stringify(value, null, 2)}\n`
              )

              response.setHeader("Content-Type", "application/json")
              response.end(JSON.stringify({ ok: true }))
              return
            }

            if (pathname === "/__odontoma-builder/flashcard-subjects") {
              if (!validateFlashcardSubjects(value)) {
                response.statusCode = 400
                response.end("Bloques de Flashcards inválidos")
                return
              }

              await validateStoredNavigation(server, "decks", value)
              await fs.writeFile(
                flashcardSubjectsPath,
                `${JSON.stringify(value, null, 2)}\n`
              )

              response.setHeader("Content-Type", "application/json")
              response.end(JSON.stringify({ ok: true }))
              return
            }

            if (pathname === "/__odontoma-builder/custom-pages") {
              if (!validateCustomPages(value)) {
                response.statusCode = 400
                response.end("Pantallas personalizadas inválidas")
                return
              }

              await validateStoredNavigation(server, "pages", value)
              await fs.writeFile(customPagesPath, `${JSON.stringify(value, null, 2)}\n`)
              response.setHeader("Content-Type", "application/json")
              response.end(JSON.stringify({ ok: true }))
              return
            }

            if (pathname === "/__odontoma-builder/ui-overrides") {
              if (!validateUiOverrides(value)) {
                response.statusCode = 400
                response.end("Personalizaciones de UI inválidas")
                return
              }

              await fs.writeFile(
                uiOverridesPath,
                `${JSON.stringify(value, null, 2)}\n`
              )

              response.setHeader("Content-Type", "application/json")
              response.end(JSON.stringify({ ok: true }))
              return
            }

            if (!validateTheme(value)) {
              response.statusCode = 400
              response.end("Configuración inválida")
              return
            }

            await Promise.all([
              fs.writeFile(
                builderThemePath,
                `${JSON.stringify(value, null, 2)}\n`
              ),
              fs.writeFile(builderCssPath, renderBuilderCss(value))
            ])

            response.setHeader("Content-Type", "application/json")
            response.end(JSON.stringify({ ok: true }))
          } catch {
            response.statusCode = 400
            response.end("No se pudo guardar la configuración")
          }
        })
      })
    }
  }
}

export default defineConfig({

  optimizeDeps: {
    exclude: [
      "@open-spaced-repetition/binding"
    ]
  },

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },

  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },

  plugins: [
    react(),
    studioServer({ written: validateOpenQuizContent, home: validateHomeContent, decks: validateFlashcardSubjects, pages: validateCustomPages, overrides: validateUiOverrides, theme: validateTheme, changelog: validChangelog }),
    tailwindcss(),
    localBuilderPlugin(),
  ],

  resolve: {

    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})

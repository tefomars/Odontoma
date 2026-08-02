import { defineConfig } from "vite"

import react from "@vitejs/plugin-react"

import tailwindcss from "@tailwindcss/vite"

import path from "path"

import { promises as fs } from "node:fs"

import type { Plugin } from "vite"

import { renderBuilderCss, type BuilderTheme } from "./src/builder/theme.ts"
import { validateUiOverrides } from "./src/content/appBuilder/uiOverrideSchema.ts"

type OpenQuizQuestion = {
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
  id: string
  title: string
  subtitle: string
  status: string
  accentColor: string
  destination:
    | "histologia"
    | "filosofia-de-hayek"
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
  if (!value || typeof value !== "object") return false

  const content = value as Partial<OpenQuizContent>

  if (!Array.isArray(content.decks) || content.decks.length > 200) {
    return false
  }

  if (
    content.classes !== undefined &&
    (!Array.isArray(content.classes) || content.classes.length > 100)
  ) {
    return false
  }

  const classIds = new Set<string>()
  const classNames = new Set<string>()

  if (content.classes && !content.classes.every(item => {
    const normalizedName = item?.name.trim().toLocaleLowerCase()
    if (
      !item ||
      !validText(item.id, 150, true) ||
      classIds.has(item.id) ||
      !validText(item.name, 120, true) ||
      classNames.has(normalizedName) ||
      !validText(item.symbol, 12, true) ||
      !validColor(item.color)
    ) {
      return false
    }

    classIds.add(item.id)
    classNames.add(normalizedName)
    return true
  })) {
    return false
  }

  const deckIds = new Set<string>()
  const questionIds = new Set<string>()

  return content.decks.every(deck => {
    if (
      !deck ||
      !validText(deck.id, 150, true) ||
      deckIds.has(deck.id) ||
      !validText(deck.title, 180, true) ||
      !validText(deck.subject, 120) ||
      !validText(deck.classSymbol || "", 12) ||
      (deck.classColor !== undefined && !validColor(deck.classColor)) ||
      !validText(deck.description || "", 800) ||
      !Array.isArray(deck.questions) ||
      deck.questions.length > 2_000
    ) {
      return false
    }

    deckIds.add(deck.id)

    return deck.questions.every(question => {
      if (
        !question ||
        !validText(question.id, 150, true) ||
        questionIds.has(question.id) ||
        !validText(question.prompt, 3_000, true) ||
        !validText(question.modelAnswer, 12_000, true) ||
        !Array.isArray(question.acceptedPoints) ||
        question.acceptedPoints.length > 100 ||
        !question.acceptedPoints.every(point => validText(point, 1_000, true)) ||
        !validText(question.explanation || "", 12_000) ||
        !validText(question.source || "", 1_000)
      ) {
        return false
      }

      questionIds.add(question.id)
      return true
    })
  })
}

function validateHomeContent(value: unknown): value is HomeContent {
  if (!value || typeof value !== "object") return false

  const content = value as Partial<HomeContent>
  const destinations = new Set([
    "histologia",
    "filosofia-de-hayek",
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

  const validCards = (
    cards: AppMenuCard[],
    expectedIds: string[]
  ) => cards.length === expectedIds.length &&
    expectedIds.every(id => cards.some(card => card.id === id)) &&
    cards.every(card =>
      validText(card.id, 80, true) &&
      validText(card.eyebrow, 80, true) &&
      validText(card.title, 180, true) &&
      validText(card.subtitle, 800, true) &&
      validText(card.symbol, 20, true) &&
      validColor(card.accentColor)
    )

  if (
    !validCards(content.mainMenu.cards, ["quizzes", "flashcards"]) ||
    !validCards(content.quizMenu.cards, ["multiple-choice", "open-ended", "my-quizzes"])
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
      !destinations.has(subject.destination)
    ) {
      return false
    }

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
          pathname !== "/__odontoma-builder/theme" &&
          pathname !== "/__odontoma-builder/open-quizzes" &&
          pathname !== "/__odontoma-builder/home-content" &&
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

        if (pathname === "/builder.html") {
          next()
          return
        }

        if (request.method === "GET") {
          response.setHeader("Cache-Control", "no-store")
          response.setHeader("Content-Type", "application/json")
          response.end(
            await fs.readFile(
              pathname === "/__odontoma-builder/open-quizzes"
                ? openQuizContentPath
                : pathname === "/__odontoma-builder/home-content"
                  ? homeContentPath
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

        let body = ""

        request.on("data", chunk => {
          body += chunk

          const maximumBodyLength =
            pathname === "/__odontoma-builder/open-quizzes" ||
            pathname === "/__odontoma-builder/home-content" ||
            pathname === "/__odontoma-builder/ui-overrides"
              ? 5_000_000
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
                response.end("Contenido de preguntas abiertas inválido")
                return
              }

              await fs.writeFile(
                openQuizContentPath,
                `${JSON.stringify(value, null, 2)}\n`
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

              await fs.writeFile(
                homeContentPath,
                `${JSON.stringify(value, null, 2)}\n`
              )

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
    tailwindcss(),
    localBuilderPlugin(),
  ],

  resolve: {

    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})

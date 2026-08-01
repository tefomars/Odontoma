import { defineConfig } from "vite"

import react from "@vitejs/plugin-react"

import tailwindcss from "@tailwindcss/vite"

import path from "path"

import { promises as fs } from "node:fs"

import type { Plugin } from "vite"

type BuilderTheme = {
  enabled: boolean
  primaryBackground: string
  primaryForeground: string
  primaryBorder: string
  outlineBackground: string
  outlineForeground: string
  outlineBorder: string
  borderWidth: number
  radius: number
  shadow: number
  fontWeight: number
  focusColor: string
  focusWidth: number
}

const builderThemePath = path.resolve(
  import.meta.dirname,
  "./src/builder/applied-theme.json"
)

const builderCssPath = path.resolve(
  import.meta.dirname,
  "./src/builder/applied-theme.css"
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

function renderBuilderCss(theme: BuilderTheme) {
  if (!theme.enabled) {
    return "/* El tema visual local está desactivado. */\n"
  }

  return `/* Generado desde builder.html. */
[data-slot="button"][data-variant="default"] {
  background: ${theme.primaryBackground} !important;
  color: ${theme.primaryForeground} !important;
  border-color: ${theme.primaryBorder} !important;
  border-width: ${theme.borderWidth}px !important;
  border-radius: ${theme.radius}px !important;
  box-shadow: 0 ${Math.round(theme.shadow / 3)}px ${theme.shadow}px rgb(0 0 0 / 35%) !important;
  font-weight: ${theme.fontWeight} !important;
}

[data-slot="button"][data-variant="outline"] {
  background: ${theme.outlineBackground} !important;
  color: ${theme.outlineForeground} !important;
  border-color: ${theme.outlineBorder} !important;
  border-width: ${theme.borderWidth}px !important;
  border-radius: ${theme.radius}px !important;
  box-shadow: 0 ${Math.round(theme.shadow / 3)}px ${theme.shadow}px rgb(0 0 0 / 35%) !important;
  font-weight: ${theme.fontWeight} !important;
}

[data-slot="button"]:focus-visible {
  outline: ${theme.focusWidth}px solid ${theme.focusColor} !important;
  outline-offset: 3px !important;
}
`
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
          pathname !== "/__odontoma-builder/theme"
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
          response.end(await fs.readFile(builderThemePath, "utf8"))
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

          if (body.length > 20_000) {
            request.destroy()
          }
        })

        request.on("end", async () => {
          try {
            const theme: unknown = JSON.parse(body)

            if (!validateTheme(theme)) {
              response.statusCode = 400
              response.end("Configuración inválida")
              return
            }

            await Promise.all([
              fs.writeFile(
                builderThemePath,
                `${JSON.stringify(theme, null, 2)}\n`
              ),
              fs.writeFile(builderCssPath, renderBuilderCss(theme))
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

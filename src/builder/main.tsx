import { StrictMode, useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"

import "../index.css"
import "./builder.css"

import OpenQuizContentEditor from "./OpenQuizContentEditor"
import LiveAppBuilder from "./LiveAppBuilder"

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

type NumericThemeKey = {
  [Key in keyof BuilderTheme]: BuilderTheme[Key] extends number ? Key : never
}[keyof BuilderTheme]

type ColorThemeKey = {
  [Key in keyof BuilderTheme]: BuilderTheme[Key] extends string ? Key : never
}[keyof BuilderTheme]

const DRAFT_KEY = "odontoma-builder-draft-v1"

const defaults: BuilderTheme = {
  enabled: false,
  primaryBackground: "#fafafa",
  primaryForeground: "#09090b",
  primaryBorder: "#fafafa",
  outlineBackground: "#111113",
  outlineForeground: "#fafafa",
  outlineBorder: "#3f3f46",
  borderWidth: 1,
  radius: 12,
  shadow: 0,
  fontWeight: 600,
  focusColor: "#34d399",
  focusWidth: 3
}

const presets: Array<{
  name: string
  description: string
  values: Partial<BuilderTheme>
}> = [
  {
    name: "Odontoma actual",
    description: "Neutro, limpio y sin sombra.",
    values: defaults
  },
  {
    name: "Clínico",
    description: "Verde suave y bordes definidos.",
    values: {
      primaryBackground: "#34d399",
      primaryForeground: "#052e24",
      primaryBorder: "#6ee7b7",
      outlineBackground: "#101513",
      outlineForeground: "#d1fae5",
      outlineBorder: "#34d399",
      borderWidth: 1,
      radius: 14,
      shadow: 12,
      fontWeight: 700,
      focusColor: "#6ee7b7",
      focusWidth: 3
    }
  },
  {
    name: "Editorial",
    description: "Esquinas discretas y alto contraste.",
    values: {
      primaryBackground: "#f4f4f5",
      primaryForeground: "#18181b",
      primaryBorder: "#f4f4f5",
      outlineBackground: "#09090b",
      outlineForeground: "#f4f4f5",
      outlineBorder: "#71717a",
      borderWidth: 2,
      radius: 6,
      shadow: 0,
      fontWeight: 800,
      focusColor: "#fbbf24",
      focusWidth: 3
    }
  },
  {
    name: "Suave",
    description: "Botones redondos con profundidad leve.",
    values: {
      primaryBackground: "#ddd6fe",
      primaryForeground: "#2e1065",
      primaryBorder: "#ede9fe",
      outlineBackground: "#18181b",
      outlineForeground: "#ede9fe",
      outlineBorder: "#8b5cf6",
      borderWidth: 1,
      radius: 24,
      shadow: 18,
      fontWeight: 700,
      focusColor: "#c4b5fd",
      focusWidth: 4
    }
  }
]

function getDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

function BuilderApp() {
  const [activePanel, setActivePanel] =
    useState<"app" | "appearance" | "content">("app")

  const [theme, setTheme] = useState<BuilderTheme>(getDraft)
  const [appliedTheme, setAppliedTheme] = useState<BuilderTheme>(defaults)
  const [status, setStatus] = useState("Cargando configuración actual…")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/__odontoma-builder/theme")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<BuilderTheme>
      })
      .then(value => {
        setAppliedTheme(value)
        setStatus(
          value.enabled
            ? "Hay un tema aplicado al proyecto."
            : "La app conserva su diseño original."
        )
      })
      .catch(() => {
        setStatus("Abre este editor desde el servidor local de Odontoma.")
      })
  }, [])

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(theme))
  }, [theme])

  const previewStyle = useMemo(() => ({
    "--preview-primary-bg": theme.primaryBackground,
    "--preview-primary-fg": theme.primaryForeground,
    "--preview-primary-border": theme.primaryBorder,
    "--preview-outline-bg": theme.outlineBackground,
    "--preview-outline-fg": theme.outlineForeground,
    "--preview-outline-border": theme.outlineBorder,
    "--preview-border-width": `${theme.borderWidth}px`,
    "--preview-radius": `${theme.radius}px`,
    "--preview-shadow": `0 ${Math.round(theme.shadow / 3)}px ${theme.shadow}px rgb(0 0 0 / 35%)`,
    "--preview-weight": theme.fontWeight,
    "--preview-focus": theme.focusColor,
    "--preview-focus-width": `${theme.focusWidth}px`
  }) as React.CSSProperties, [theme])

  function updateNumber(key: NumericThemeKey, value: number) {
    setTheme(current => ({ ...current, [key]: value }))
  }

  function updateColor(key: ColorThemeKey, value: string) {
    setTheme(current => ({ ...current, [key]: value }))
  }

  async function persist(nextTheme: BuilderTheme, message: string) {
    setSaving(true)
    setStatus("Guardando…")

    try {
      const response = await fetch("/__odontoma-builder/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextTheme)
      })

      if (!response.ok) throw new Error(await response.text())

      setAppliedTheme(nextTheme)
      setStatus(message)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `No se pudo guardar: ${error.message}`
          : "No se pudo guardar."
      )
    } finally {
      setSaving(false)
    }
  }

  function applyTheme() {
    void persist(
      { ...theme, enabled: true },
      "Cambios aplicados. La app local se actualizará automáticamente."
    )
  }

  function restoreOriginal() {
    const restored = { ...defaults, enabled: false }
    setTheme(restored)
    void persist(
      restored,
      "Diseño original restaurado. No quedan overrides activos."
    )
  }

  function discardDraft() {
    setTheme(appliedTheme.enabled ? appliedTheme : defaults)
    setStatus("El borrador volvió a la última versión aplicada.")
  }

  return (
    <main className="builder-app">
      <header className="builder-header">
        <div>
          <span className="local-badge">SOLO LOCAL</span>
          <p className="eyebrow">ODONTOMA · VISUAL BUILDER</p>
          <h1>
            {activePanel === "app"
              ? "Edita Odontoma directamente."
              : activePanel === "appearance"
                ? "Edita el estilo sin tocar código."
                : "Crea contenido sin tocar código."}
          </h1>
          <p className="intro">
            {activePanel === "app"
              ? "Usa el + y los lápices sobre la interfaz real."
              : activePanel === "appearance"
                ? "Experimenta dentro de la vista previa."
                : "Agrega clases, cuestionarios, preguntas, respuestas y criterios de corrección."}
            {" "}Odontoma no cambia hasta que pulses{" "}
            <strong>Aplicar al proyecto</strong>.
          </p>
        </div>
        <a className="app-link" href="/" target="_blank" rel="noreferrer">
          Abrir Odontoma ↗
        </a>
      </header>

      <nav className="builder-navigation" aria-label="Secciones del builder">
        <button
          className={activePanel === "app" ? "active" : ""}
          onClick={() => setActivePanel("app")}
        >
          <span>▣</span>
          Editar la app
        </button>
        <button
          className={activePanel === "appearance" ? "active" : ""}
          onClick={() => setActivePanel("appearance")}
        >
          <span>◐</span>
          Apariencia
        </button>
        <button
          className={activePanel === "content" ? "active" : ""}
          onClick={() => setActivePanel("content")}
        >
          <span>✎</span>
          Contenido · Preguntas abiertas
        </button>
      </nav>

      {activePanel === "app" ? (
        <LiveAppBuilder />
      ) : activePanel === "appearance" ? (
      <section className="workspace">
        <aside className="controls-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CONTROLES</p>
              <h2>Botones</h2>
            </div>
            <span className="draft-state">Borrador automático</span>
          </div>

          <ControlGroup title="Presets">
            <div className="preset-grid">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  className="preset-card"
                  onClick={() => setTheme(current => ({
                    ...current,
                    ...preset.values,
                    enabled: current.enabled
                  }))}
                >
                  <strong>{preset.name}</strong>
                  <span>{preset.description}</span>
                </button>
              ))}
            </div>
          </ControlGroup>

          <ControlGroup title="Botón principal">
            <ColorControl
              label="Fondo"
              value={theme.primaryBackground}
              onChange={value => updateColor("primaryBackground", value)}
            />
            <ColorControl
              label="Texto"
              value={theme.primaryForeground}
              onChange={value => updateColor("primaryForeground", value)}
            />
            <ColorControl
              label="Borde"
              value={theme.primaryBorder}
              onChange={value => updateColor("primaryBorder", value)}
            />
          </ControlGroup>

          <ControlGroup title="Botón outline">
            <ColorControl
              label="Fondo"
              value={theme.outlineBackground}
              onChange={value => updateColor("outlineBackground", value)}
            />
            <ColorControl
              label="Texto"
              value={theme.outlineForeground}
              onChange={value => updateColor("outlineForeground", value)}
            />
            <ColorControl
              label="Borde"
              value={theme.outlineBorder}
              onChange={value => updateColor("outlineBorder", value)}
            />
          </ControlGroup>

          <ControlGroup title="Forma y profundidad">
            <RangeControl
              label="Grosor del borde"
              value={theme.borderWidth}
              minimum={0}
              maximum={8}
              unit="px"
              onChange={value => updateNumber("borderWidth", value)}
            />
            <RangeControl
              label="Radio"
              value={theme.radius}
              minimum={0}
              maximum={40}
              unit="px"
              onChange={value => updateNumber("radius", value)}
            />
            <RangeControl
              label="Sombra"
              value={theme.shadow}
              minimum={0}
              maximum={40}
              unit="px"
              onChange={value => updateNumber("shadow", value)}
            />
            <RangeControl
              label="Peso del texto"
              value={theme.fontWeight}
              minimum={400}
              maximum={900}
              step={100}
              onChange={value => updateNumber("fontWeight", value)}
            />
          </ControlGroup>

          <ControlGroup title="Outline de foco">
            <ColorControl
              label="Color"
              value={theme.focusColor}
              onChange={value => updateColor("focusColor", value)}
            />
            <RangeControl
              label="Grosor"
              value={theme.focusWidth}
              minimum={1}
              maximum={8}
              unit="px"
              onChange={value => updateNumber("focusWidth", value)}
            />
          </ControlGroup>
        </aside>

        <section className="preview-panel">
          <div className="preview-toolbar">
            <div>
              <p className="eyebrow">VISTA PREVIA AISLADA</p>
              <h2>Estados del componente</h2>
            </div>
            <span>Haz Tab para ver el outline</span>
          </div>

          <div className="preview-canvas" style={previewStyle}>
            <div className="mock-window">
              <div className="mock-navigation">
                <div className="mock-logo">O</div>
                <div>
                  <strong>Odontoma</strong>
                  <span>Sesión de estudio</span>
                </div>
              </div>

              <div className="mock-content">
                <span className="mock-label">CAPÍTULO 14</span>
                <h3>¿Listo para comenzar el repaso?</h3>
                <p>
                  Estos botones son una muestra. No ejecutan acciones ni
                  modifican tu progreso.
                </p>

                <div className="button-demo">
                  <button className="preview-button primary">
                    Comenzar práctica
                  </button>
                  <button className="preview-button outline">
                    Ver tarjetas pendientes
                  </button>
                </div>

                <div className="state-grid">
                  <div>
                    <span>Normal</span>
                    <button className="preview-button primary compact">
                      Guardar
                    </button>
                  </div>
                  <div>
                    <span>Outline</span>
                    <button className="preview-button outline compact">
                      Editar
                    </button>
                  </div>
                  <div>
                    <span>Desactivado</span>
                    <button className="preview-button primary compact" disabled>
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="action-panel">
            <div className="status-copy">
              <span className={appliedTheme.enabled ? "status-dot active" : "status-dot"} />
              <div>
                <strong>Estado del proyecto</strong>
                <p>{status}</p>
              </div>
            </div>

            <div className="actions">
              <button
                className="builder-button secondary"
                onClick={discardDraft}
                disabled={saving}
              >
                Descartar borrador
              </button>
              <button
                className="builder-button danger"
                onClick={restoreOriginal}
                disabled={saving}
              >
                Restaurar original
              </button>
              <button
                className="builder-button apply"
                onClick={applyTheme}
                disabled={saving}
              >
                {saving ? "Aplicando…" : "Aplicar al proyecto"}
              </button>
            </div>
          </div>
        </section>
      </section>
      ) : (
        <OpenQuizContentEditor />
      )}

      <footer>
        Este editor no se incluye en el build público de Vercel. Los cambios
        permanentes quedan en archivos locales, versionables y reversibles.
      </footer>
    </main>
  )
}

function ControlGroup({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="control-group">
      <h3>{title}</h3>
      <div className="control-stack">{children}</div>
    </section>
  )
}

function ColorControl({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="color-control">
      <span>{label}</span>
      <span className="color-input-wrap">
        <input
          type="color"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
        <code>{value.toUpperCase()}</code>
      </span>
    </label>
  )
}

function RangeControl({
  label,
  value,
  minimum,
  maximum,
  step = 1,
  unit = "",
  onChange
}: {
  label: string
  value: number
  minimum: number
  maximum: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="range-control">
      <span className="range-heading">
        <span>{label}</span>
        <strong>{value}{unit}</strong>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}

createRoot(document.getElementById("builder-root")!).render(
  <StrictMode>
    <BuilderApp />
  </StrictMode>
)

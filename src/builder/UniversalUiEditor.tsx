import { useEffect, useRef, useState, type ReactNode } from "react"

import type { UiOverride } from "@/content/appBuilder/uiOverrides"

const UI_DRAFT_KEY = "odontoma-ui-overrides-draft-v1"

type SelectionMode = "navigate" | "text" | "container"

type SelectedElement = {
  screenKey: string
  selector: string
  label: string
  originalText: string
  textColor: string
  backgroundColor: string
  borderColor: string
  borderRadius: number
}

function cloneSelector(id: string) {
  return `[data-ui-clone-id="${CSS.escape(id)}"]`
}

function readDraft() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(UI_DRAFT_KEY) || "null")
    return Array.isArray(parsed) ? parsed as UiOverride[] : null
  } catch {
    return null
  }
}

function createId() {
  return `ui-override-${Date.now()}-${crypto.randomUUID()}`
}

function cssColorToHex(value: string, document: Document) {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext("2d")
  if (!context) return "#000000"

  context.clearRect(0, 0, 1, 1)
  context.fillStyle = value
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return `#${[red, green, blue].map(number => number.toString(16).padStart(2, "0")).join("")}`
}

function pathFromRoot(element: HTMLElement, root: HTMLElement) {
  const cloneRoot = element.closest<HTMLElement>("[data-ui-clone-id]")
  if (cloneRoot && cloneRoot !== root && root.contains(cloneRoot)) {
    const prefix = cloneSelector(cloneRoot.dataset.uiCloneId || "")
    if (element === cloneRoot) return prefix
    const suffix = pathFromRoot(element, cloneRoot)
    return suffix ? `${prefix} > ${suffix}` : prefix
  }

  const parts: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement
    if (!parent) return ""
    const tag = current.tagName.toLowerCase()
    const siblings = Array.from(parent.children).filter(item => item.tagName === current?.tagName)
    const position = siblings.indexOf(current) + 1
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${position})` : tag)
    current = parent
  }

  return parts.join(" > ")
}

function createPreviewClone(root: HTMLElement, source: HTMLElement, override: UiOverride) {
  const existing = root.querySelector<HTMLElement>(cloneSelector(override.id))
  if (existing) return existing

  const clone = source.cloneNode(true) as HTMLElement
  clone.dataset.uiCloneId = override.id
  clone.removeAttribute("id")
  clone.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"))
  clone.addEventListener("click", event => {
    event.preventDefault()
    event.stopPropagation()
    source.click()
  })
  source.insertAdjacentElement("afterend", clone)
  return clone
}

function applyPreviewOverrides(document: Document, overrides: UiOverride[]) {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-screen-key]"))

  for (const override of overrides) {
    if (!override.cloneOf) continue
    const root = roots.find(item => item.dataset.screenKey === override.screenKey)
    const source = root?.querySelector<HTMLElement>(override.cloneOf)
    if (root && source) createPreviewClone(root, source, override)
  }

  for (const override of overrides) {
    const root = roots.find(item => item.dataset.screenKey === override.screenKey)
    if (!root) continue
    try {
      const element = root.querySelector<HTMLElement>(override.selector)
      if (!element) continue
      if (override.hidden === true) element.style.setProperty("display", "none", "important")
      if (override.hidden === false) element.style.removeProperty("display")
      if (override.text !== undefined) element.textContent = override.text
      if (override.textColor) element.style.setProperty("color", override.textColor, "important")
      if (override.backgroundColor) element.style.setProperty("background-color", override.backgroundColor, "important")
      if (override.borderColor) element.style.setProperty("border-color", override.borderColor, "important")
      if (override.borderRadius !== undefined) element.style.setProperty("border-radius", `${override.borderRadius}px`, "important")
    } catch {
      // Un selector antiguo no debe romper la vista editable.
    }
  }
}

function findTextTarget(start: HTMLElement, root: HTMLElement) {
  let current: HTMLElement | null = start
  while (current && current !== root) {
    if (current.children.length === 0 && current.textContent?.trim()) return current
    current = current.parentElement
  }
  return null
}

function findContainerTarget(start: HTMLElement, root: HTMLElement) {
  const target = start.closest<HTMLElement>("button, article, section, [role='button'], div")
  return target && target !== root && root.contains(target) ? target : null
}

export default function UniversalUiEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const selectedNodeRef = useRef<HTMLElement | null>(null)
  const [mode, setMode] = useState<SelectionMode>("navigate")
  const [overrides, setOverrides] = useState<UiOverride[]>([])
  const [appliedOverrides, setAppliedOverrides] = useState<UiOverride[]>([])
  const [selection, setSelection] = useState<SelectedElement | null>(null)
  const [status, setStatus] = useState("Cargando personalizaciones…")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentScreenKey, setCurrentScreenKey] = useState<string | null>(null)

  useEffect(() => {
    fetch("/__odontoma-builder/ui-overrides")
      .then(response => {
        if (!response.ok) throw new Error("No disponible")
        return response.json() as Promise<UiOverride[]>
      })
      .then(value => {
        const draft = readDraft()
        setAppliedOverrides(value)
        setOverrides(draft || value)
        setStatus(draft ? "Se recuperó tu borrador universal." : "Navegá hasta cualquier pantalla para editarla.")
        setLoaded(true)
      })
      .catch(() => {
        setStatus("No se pudieron cargar las personalizaciones.")
        setLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(UI_DRAFT_KEY, JSON.stringify(overrides))
  }, [loaded, overrides])

  useEffect(() => {
    const frame = iframeRef.current
    const attach = () => {
      const document = frame?.contentDocument
      if (!document) return () => undefined
      applyPreviewOverrides(document, overrides)

      const handleClick = (event: MouseEvent) => {
        if (mode === "navigate") return
        event.preventDefault()
        event.stopPropagation()

        const rawTarget = event.target as HTMLElement | null
        if (!rawTarget || typeof rawTarget.closest !== "function") return
        const root = rawTarget.closest<HTMLElement>("[data-screen-key]")
        if (!root) {
          setStatus("Esta vista aún no tiene una raíz editable. Recargá el editor si acaba de abrirse.")
          return
        }
        setCurrentScreenKey(root.dataset.screenKey || null)

        const target = mode === "text"
          ? findTextTarget(rawTarget, root)
          : findContainerTarget(rawTarget, root)
        if (!target) {
          setStatus(mode === "text" ? "Elegí directamente un texto." : "Elegí un botón, tarjeta o sección.")
          return
        }

        const selector = pathFromRoot(target, root)
        if (!selector) return
        const computed = frame.contentWindow!.getComputedStyle(target)
        const existing = overrides.find(item =>
          item.screenKey === root.dataset.screenKey && item.selector === selector)
        const originalText = target.textContent?.trim() || target.tagName.toLowerCase()

        selectedNodeRef.current?.removeAttribute("data-universal-editor-selected")
        target.setAttribute("data-universal-editor-selected", "true")
        selectedNodeRef.current = target
        setSelection({
          screenKey: root.dataset.screenKey || "unknown",
          selector,
          label: existing?.label || originalText.slice(0, 100),
          originalText,
          textColor: existing?.textColor || cssColorToHex(computed.color, document),
          backgroundColor: existing?.backgroundColor || cssColorToHex(computed.backgroundColor, document),
          borderColor: existing?.borderColor || cssColorToHex(computed.borderColor, document),
          borderRadius: existing?.borderRadius ?? Math.round(Number.parseFloat(computed.borderRadius) || 0)
        })
        setStatus(`Seleccionado en “${root.dataset.screenKey}”.`)
      }

      document.addEventListener("click", handleClick, true)
      const syncScreen = () => {
        const root = document.querySelector<HTMLElement>("[data-screen-key]")
        setCurrentScreenKey(root?.dataset.screenKey || null)
      }
      syncScreen()
      const observer = new MutationObserver(syncScreen)
      observer.observe(document.body, { childList: true, subtree: true })
      return () => {
        document.removeEventListener("click", handleClick, true)
        observer.disconnect()
      }
    }

    let detach = attach()
    const handleLoad = () => {
      detach()
      detach = attach()
      setSelection(null)
      selectedNodeRef.current = null
    }
    frame?.addEventListener("load", handleLoad)

    return () => {
      detach()
      frame?.removeEventListener("load", handleLoad)
    }
  }, [mode, overrides])

  const selectedOverride = selection
    ? overrides.find(item => item.screenKey === selection.screenKey && item.selector === selection.selector)
    : undefined
  const hiddenBlocks = overrides.filter(item =>
    item.screenKey === currentScreenKey && item.hidden === true)

  function updateSelection(changes: Partial<UiOverride>) {
    if (!selection) return
    const current: UiOverride = selectedOverride || {
      id: createId(),
      screenKey: selection.screenKey,
      selector: selection.selector,
      label: selection.label
    }
    const next = { ...current, ...changes }

    setOverrides(items => {
      const exists = items.some(item => item.id === current.id)
      return exists ? items.map(item => item.id === current.id ? next : item) : [...items, next]
    })

    const node = selectedNodeRef.current
    if (!node) return
    if (changes.text !== undefined) node.textContent = changes.text
    if (changes.textColor) node.style.setProperty("color", changes.textColor, "important")
    if (changes.backgroundColor) node.style.setProperty("background-color", changes.backgroundColor, "important")
    if (changes.borderColor) node.style.setProperty("border-color", changes.borderColor, "important")
    if (changes.borderRadius !== undefined) node.style.setProperty("border-radius", `${changes.borderRadius}px`, "important")
  }

  function removeSelectedOverride() {
    if (!selectedOverride) return
    setOverrides(items => items.filter(item => item.id !== selectedOverride.id))
    setSelection(null)
    selectedNodeRef.current = null
    iframeRef.current?.contentWindow?.location.reload()
    setStatus("Personalización quitada del borrador.")
  }

  function hideSelectedBlock() {
    if (!selection || !selectedNodeRef.current) return
    const label = selection.label
    updateSelection({ hidden: true })
    selectedNodeRef.current.removeAttribute("data-universal-editor-selected")
    selectedNodeRef.current = null
    setSelection(null)
    setStatus(`“${label}” quedó oculto en el borrador. Podés restaurarlo desde el panel.`)
  }

  function restoreHiddenBlock(override: UiOverride) {
    setOverrides(items => items.map(item =>
      item.id === override.id ? { ...item, hidden: false } : item
    ))
    const document = iframeRef.current?.contentDocument
    const root = document?.querySelector<HTMLElement>(`[data-screen-key="${CSS.escape(override.screenKey)}"]`)
    try {
      root?.querySelector<HTMLElement>(override.selector)?.style.removeProperty("display")
    } catch {
      // El botón de restaurar sigue siendo seguro aunque el selector ya no exista.
    }
    setStatus(`“${override.label}” volvió a mostrarse en el borrador.`)
  }

  function duplicateSelectedBlock() {
    if (!selection || !selectedNodeRef.current) return
    const source = selectedNodeRef.current
    const root = source.closest<HTMLElement>("[data-screen-key]")
    if (!root) return
    const id = createId()
    const override: UiOverride = {
      id,
      screenKey: selection.screenKey,
      selector: cloneSelector(id),
      label: `Copia de ${selection.label}`,
      cloneOf: selection.selector
    }
    const clone = createPreviewClone(root, source, override)
    const computed = iframeRef.current?.contentWindow?.getComputedStyle(clone)
    setOverrides(items => [...items, override])
    source.removeAttribute("data-universal-editor-selected")
    clone.setAttribute("data-universal-editor-selected", "true")
    selectedNodeRef.current = clone
    setSelection({
      screenKey: selection.screenKey,
      selector: override.selector,
      label: override.label,
      originalText: clone.textContent?.trim() || "Bloque duplicado",
      textColor: computed ? cssColorToHex(computed.color, root.ownerDocument) : "#ffffff",
      backgroundColor: computed ? cssColorToHex(computed.backgroundColor, root.ownerDocument) : "#000000",
      borderColor: computed ? cssColorToHex(computed.borderColor, root.ownerDocument) : "#27272a",
      borderRadius: computed ? Math.round(Number.parseFloat(computed.borderRadius) || 0) : 0
    })
    setStatus("Bloque duplicado. Conserva la misma acción del original; ahora podés cambiar su texto y apariencia.")
  }

  async function applyOverrides() {
    setSaving(true)
    setStatus("Aplicando personalizaciones…")
    try {
      const response = await fetch("/__odontoma-builder/ui-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrides)
      })
      if (!response.ok) throw new Error(await response.text())
      setAppliedOverrides(overrides)
      localStorage.removeItem(UI_DRAFT_KEY)
      setStatus("Personalizaciones aplicadas al proyecto.")
      iframeRef.current?.contentWindow?.location.reload()
    } catch (error) {
      setStatus(error instanceof Error ? `No se pudo aplicar: ${error.message}` : "No se pudo aplicar.")
    } finally {
      setSaving(false)
    }
  }

  function discardDraft() {
    setOverrides(appliedOverrides)
    setSelection(null)
    localStorage.removeItem(UI_DRAFT_KEY)
    iframeRef.current?.contentWindow?.location.reload()
    setStatus("Borrador descartado.")
  }

  return (
    <section className="universal-editor">
      <div className="universal-stage">
        <div className="universal-toolbar">
          <div>
            <p className="eyebrow">EDITOR UNIVERSAL</p>
            <strong>Cualquier pantalla de Odontoma</strong>
          </div>
          <div className="universal-mode-switcher">
            <button className={mode === "navigate" ? "active" : ""} onClick={() => setMode("navigate")}>Navegar</button>
            <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>Editar texto</button>
            <button className={mode === "container" ? "active" : ""} onClick={() => setMode("container")}>Bloques</button>
          </div>
        </div>
        <p className="universal-hint">
          {mode === "navigate"
            ? "Usá la app normalmente hasta llegar a la pantalla que querés modificar."
            : mode === "text"
              ? "Pulsá un título, descripción, etiqueta o símbolo."
              : "Pulsá un botón, tarjeta o sección para editarlo, duplicarlo u ocultarlo."}
        </p>
        <div className="universal-frame-wrap">
          <iframe ref={iframeRef} src="/?builder-preview=1" title="Odontoma editable" />
        </div>
      </div>

      <aside className={`live-inspector universal-inspector ${selection ? "open" : ""}`}>
        {selection ? (
          <>
            <header className="inspector-header">
              <div><p className="eyebrow">EDITANDO · {selection.screenKey}</p><h2>{selection.label}</h2></div>
              <button className="inspector-close" onClick={() => setSelection(null)} aria-label="Cerrar editor">×</button>
            </header>
            <div className="inspector-fields">
              {mode === "text" && (
                <InspectorField label="Texto">
                  <textarea rows={5} value={selectedOverride?.text ?? selection.originalText} onChange={event => updateSelection({ text: event.target.value })} />
                </InspectorField>
              )}
              <InspectorField label="Color del texto">
                <ColorInput value={selectedOverride?.textColor || selection.textColor} onChange={textColor => updateSelection({ textColor })} />
              </InspectorField>
              {mode === "container" && (
                <>
                  <InspectorField label="Color del fondo"><ColorInput value={selectedOverride?.backgroundColor || selection.backgroundColor} onChange={backgroundColor => updateSelection({ backgroundColor })} /></InspectorField>
                  <InspectorField label="Color del borde"><ColorInput value={selectedOverride?.borderColor || selection.borderColor} onChange={borderColor => updateSelection({ borderColor })} /></InspectorField>
                  <InspectorField label="Radio"><input type="range" min="0" max="120" value={selectedOverride?.borderRadius ?? selection.borderRadius} onChange={event => updateSelection({ borderRadius: Number(event.target.value) })} /><code>{selectedOverride?.borderRadius ?? selection.borderRadius}px</code></InspectorField>
                  <div className="structure-actions">
                    <button type="button" onClick={duplicateSelectedBlock}>＋ Duplicar bloque</button>
                    <button type="button" className="danger" onClick={hideSelectedBlock}>− Ocultar bloque</button>
                  </div>
                  <p className="destination-help">Un bloque duplicado conserva la acción del original. Para agregar contenido con una función nueva, usá el editor especializado correspondiente.</p>
                </>
              )}
              {selectedOverride && <button className="inspector-delete" onClick={removeSelectedOverride}>Quitar esta personalización</button>}
            </div>
          </>
        ) : (
          <div className="inspector-empty"><span>◎</span><h2>Navegá y seleccioná</h2><p>Primero usá <strong>Navegar</strong>. Después elegí <strong>Editar texto</strong> o <strong>Bloques</strong>.</p></div>
        )}
        {hiddenBlocks.length > 0 && (
          <section className="hidden-blocks-panel">
            <p className="eyebrow">OCULTOS EN ESTA PANTALLA</p>
            {hiddenBlocks.map(item => (
              <button type="button" key={item.id} onClick={() => restoreHiddenBlock(item)}>
                <span>{item.label}</span>
                <strong>Restaurar</strong>
              </button>
            ))}
          </section>
        )}
        <footer className="inspector-actions">
          <div className="inspector-status"><span className="status-dot active" /><p>{status}</p></div>
          <p className="destination-help">{overrides.length} personalizaciones en el borrador.</p>
          <div className="actions">
            <button className="builder-button secondary" onClick={discardDraft} disabled={saving}>Descartar</button>
            <button className="builder-button apply" onClick={applyOverrides} disabled={saving}>{saving ? "Aplicando…" : "Aplicar a Odontoma"}</button>
          </div>
        </footer>
      </aside>
    </section>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <span className="inspector-color-row"><input type="color" value={value} onChange={event => onChange(event.target.value)} /><code>{value.toUpperCase()}</code></span>
}

function InspectorField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="inspector-field"><span><strong>{label}</strong></span>{children}</label>
}

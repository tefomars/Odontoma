import { useEffect } from "react"

import { uiOverrides, type UiOverride } from "@/content/appBuilder/uiOverrides"

function applyOverride(element: HTMLElement, override: UiOverride) {
  if (override.text !== undefined && element.textContent !== override.text) {
    element.textContent = override.text
  }
  if (override.textColor && element.style.color !== override.textColor) {
    element.style.setProperty("color", override.textColor, "important")
  }
  if (override.backgroundColor && element.style.backgroundColor !== override.backgroundColor) {
    element.style.setProperty("background-color", override.backgroundColor, "important")
  }
  if (override.borderColor && element.style.borderColor !== override.borderColor) {
    element.style.setProperty("border-color", override.borderColor, "important")
  }
  if (override.borderRadius !== undefined) {
    const radius = `${override.borderRadius}px`
    if (element.style.borderRadius !== radius) {
      element.style.setProperty("border-radius", radius, "important")
    }
  }
  element.dataset.uiOverrideId = override.id
}

function applyAllOverrides() {
  if (uiOverrides.length === 0) return

  const screenRoots = Array.from(
    document.querySelectorAll<HTMLElement>("[data-screen-key]")
  )

  for (const override of uiOverrides) {
    const root = screenRoots.find(item => item.dataset.screenKey === override.screenKey)
    if (!root) continue

    try {
      const element = root.querySelector<HTMLElement>(override.selector)
      if (element) applyOverride(element, override)
    } catch {
      // Un selector antiguo nunca debe impedir que la app cargue.
    }
  }
}

export default function UiOverrideApplier() {
  useEffect(() => {
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(applyAllOverrides)
    }
    const observer = new MutationObserver(schedule)

    applyAllOverrides()
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return null
}

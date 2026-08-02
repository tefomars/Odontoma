import { useEffect } from "react"

import { uiOverrides, type UiOverride } from "@/content/appBuilder/uiOverrides"

function applyOverride(element: HTMLElement, override: UiOverride) {
  if (override.hidden === true) {
    element.style.setProperty("display", "none", "important")
  } else if (override.hidden === false) {
    element.style.removeProperty("display")
  }
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

function createClone(root: HTMLElement, override: UiOverride) {
  if (!override.cloneOf || root.querySelector(`[data-ui-clone-id="${CSS.escape(override.id)}"]`)) return

  const source = root.querySelector<HTMLElement>(override.cloneOf)
  if (!source) return
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
}

function applyAllOverrides() {
  if (uiOverrides.length === 0) return

  const screenRoots = Array.from(
    document.querySelectorAll<HTMLElement>("[data-screen-key]")
  )

  for (const override of uiOverrides) {
    if (!override.cloneOf) continue
    const root = screenRoots.find(item => item.dataset.screenKey === override.screenKey)
    if (root) createClone(root, override)
  }

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

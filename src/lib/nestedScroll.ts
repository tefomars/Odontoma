import type { WheelEvent } from "react"

/**
 * Hace que el espacio exterior de una pantalla con panel fijo también controle
 * su área desplazable, sin cambiar el tamaño ni la posición visual del panel.
 */
export function relayWheelToPanel(
  event: WheelEvent<HTMLElement>,
  panelSelector = ".flashcard-book-scroll"
) {
  if (event.defaultPrevented || event.deltaY === 0) {
    return
  }

  const target = event.target

  if (
    target instanceof Element &&
    (
      target.closest(panelSelector) ||
      target.closest("[data-independent-scroll]")
    )
  ) {
    return
  }

  const panel =
    event.currentTarget.querySelector<HTMLElement>(
      panelSelector
    )

  if (!panel || panel.scrollHeight <= panel.clientHeight) {
    return
  }

  const previousScrollTop = panel.scrollTop
  panel.scrollTop += event.deltaY

  if (panel.scrollTop !== previousScrollTop) {
    event.preventDefault()
  }
}

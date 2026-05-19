import { useEffect } from "react"

type SwipeBackOptions = {
  enabled?: boolean
  edgeOnly?: boolean
  edgeSize?: number
  minDistance?: number
  maxVerticalDrift?: number
  onBack?: () => void
}

export function useSwipeBack({
  enabled = true,
  edgeOnly = true,
  edgeSize = 48,
  minDistance = 85,
  maxVerticalDrift = 70,
  onBack
}: SwipeBackOptions = {}) {
  useEffect(() => {
    if (!enabled) return

    let startX = 0
    let startY = 0
    let tracking = false

    function isEditableTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false

      return Boolean(
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("[contenteditable='true']")
      )
    }

    function findBackButton() {
      const buttons =
        Array.from(document.querySelectorAll("button"))

      return buttons.find(button => {
        const text =
          button.textContent?.trim().toLowerCase() || ""

        return (
          text.includes("volver") ||
          text.includes("atrás") ||
          text.includes("atras") ||
          text === "←" ||
          text.startsWith("←")
        )
      })
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== "touch") return
      if (isEditableTarget(event.target)) return

      startX = event.clientX
      startY = event.clientY

      tracking =
        !edgeOnly ||
        startX <= edgeSize
    }

    function handlePointerUp(event: PointerEvent) {
      if (!tracking) return
      if (event.pointerType !== "touch") return

      const deltaX =
        event.clientX - startX

      const deltaY =
        Math.abs(event.clientY - startY)

      tracking = false

      if (
        deltaX >= minDistance &&
        deltaY <= maxVerticalDrift
      ) {
        if (onBack) {
          onBack()
          return
        }

        const backButton =
          findBackButton()

        if (backButton) {
          backButton.click()
        }
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [
    enabled,
    edgeOnly,
    edgeSize,
    minDistance,
    maxVerticalDrift,
    onBack
  ])
}

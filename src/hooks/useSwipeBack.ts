import { useEffect, useRef } from "react"

type Options = {
  onBack: () => void
  enabled?: boolean
  minDistance?: number
  maxVerticalDrift?: number
}

export function useSwipeBack({
  onBack,
  enabled = true,
  minDistance = 105,
  maxVerticalDrift = 75
}: Options) {
  const startX = useRef(0)
  const startY = useRef(0)
  const latestX = useRef(0)
  const dragging = useRef(false)
  const tracking = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const root =
      document.documentElement

    function resetSwipe() {
      root.style.setProperty("--swipe-back-x", "0px")
      root.style.setProperty("--swipe-back-opacity", "1")
      root.classList.remove("is-swiping-back")
    }

    function isInteractiveElement(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false

      return Boolean(
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("a") ||
        target.closest("[data-no-swipe-back='true']")
      )
    }

    function handleTouchStart(event: TouchEvent) {
      const touch =
        event.touches[0]

      if (!touch) return

      if (isInteractiveElement(event.target)) {
        tracking.current = false
        dragging.current = false
        return
      }

      startX.current = touch.clientX
      startY.current = touch.clientY
      latestX.current = touch.clientX
      tracking.current = true
      dragging.current = false
    }

    function handleTouchMove(event: TouchEvent) {
      if (!tracking.current) return

      const touch =
        event.touches[0]

      if (!touch) return

      const deltaX =
        touch.clientX - startX.current

      const deltaY =
        touch.clientY - startY.current

      const isRightSwipe =
        deltaX > 8

      const isMostlyHorizontal =
        Math.abs(deltaY) <= maxVerticalDrift

      if (!isRightSwipe || !isMostlyHorizontal) {
        return
      }

      dragging.current = true
      latestX.current = touch.clientX

      const maxDrag =
        window.innerWidth * 0.42

      const eased =
        Math.min(deltaX, maxDrag)

      const opacity =
        Math.max(0.78, 1 - eased / 950)

      root.classList.add("is-swiping-back")
      root.style.setProperty("--swipe-back-x", `${eased}px`)
      root.style.setProperty("--swipe-back-opacity", `${opacity}`)
    }

    function handleTouchEnd() {
      if (!tracking.current) return

      tracking.current = false

      const deltaX =
        latestX.current - startX.current

      if (dragging.current && deltaX >= minDistance) {
        root.classList.add("is-swiping-back")
        root.style.setProperty("--swipe-back-x", `${window.innerWidth}px`)
        root.style.setProperty("--swipe-back-opacity", "0.72")

        window.setTimeout(() => {
          onBack()
          resetSwipe()
        }, 120)

        dragging.current = false
        return
      }

      root.classList.remove("is-swiping-back")
      root.style.setProperty("--swipe-back-x", "0px")
      root.style.setProperty("--swipe-back-opacity", "1")

      dragging.current = false
    }

    function handleTouchCancel() {
      tracking.current = false
      dragging.current = false
      resetSwipe()
    }

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true
    })

    window.addEventListener("touchmove", handleTouchMove, {
      passive: true
    })

    window.addEventListener("touchend", handleTouchEnd, {
      passive: true
    })

    window.addEventListener("touchcancel", handleTouchCancel, {
      passive: true
    })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchCancel)
      resetSwipe()
    }
  }, [
    onBack,
    enabled,
    minDistance,
    maxVerticalDrift
  ])
}

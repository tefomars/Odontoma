import { useEffect, useRef } from "react"

type Options = {
  onBack: () => void
  enabled?: boolean
  minDistance?: number
  maxVerticalDrift?: number
  edgeWidth?: number
  visualFeedback?: boolean
}

export function useSwipeBack({
  onBack,
  enabled = true,
  minDistance = 80,
  maxVerticalDrift = 96,
  edgeWidth = 56,
  visualFeedback = false
}: Options) {
  const startX = useRef(0)
  const startY = useRef(0)
  const latestX = useRef(0)
  const latestY = useRef(0)
  const tracking = useRef(false)
  const dragging = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const root =
      document.documentElement

    function resetSwipe(animated = true) {
      if (animated) {
        root.classList.add("swipe-back-settling")
      }

      root.classList.remove("is-swiping-back")
      root.style.setProperty("--swipe-back-x", "0px")
      root.style.setProperty("--swipe-back-opacity", "1")
      root.style.setProperty("--swipe-back-scale", "1")

      window.setTimeout(() => {
        root.classList.remove("swipe-back-settling")
      }, 220)
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

      if (touch.clientX > edgeWidth) {
        tracking.current = false
        dragging.current = false
        return
      }

      startX.current = touch.clientX
      startY.current = touch.clientY
      latestX.current = touch.clientX
      latestY.current = touch.clientY
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

      if (!dragging.current) {
        const movement =
          Math.max(Math.abs(deltaX), Math.abs(deltaY))

        if (movement < 12) return

        const isClearlyHorizontal =
          deltaX > 0 &&
          Math.abs(deltaX) >= Math.abs(deltaY) * 1.05

        if (!isClearlyHorizontal) {
          tracking.current = false
          return
        }
      }

      if (deltaX <= 0 || Math.abs(deltaY) > maxVerticalDrift) {
        tracking.current = false
        dragging.current = false
        resetSwipe(false)
        return
      }

      dragging.current = true
      latestX.current = touch.clientX
      latestY.current = touch.clientY

      if (!visualFeedback) return

      const maxDrag =
        window.innerWidth * 0.55

      const eased =
        Math.min(deltaX, maxDrag)

      const progress =
        Math.min(eased / window.innerWidth, 1)

      const opacity =
        Math.max(0.78, 1 - progress * 0.34)

      const scale =
        Math.max(0.985, 1 - progress * 0.018)

      root.classList.add("is-swiping-back")
      root.classList.remove("swipe-back-settling")
      root.style.setProperty("--swipe-back-x", `${eased}px`)
      root.style.setProperty("--swipe-back-opacity", `${opacity}`)
      root.style.setProperty("--swipe-back-scale", `${scale}`)
    }

    function handleTouchEnd() {
      if (!tracking.current) return

      tracking.current = false

      const deltaX =
        latestX.current - startX.current

      const deltaY =
        latestY.current - startY.current

      if (
        dragging.current &&
        deltaX >= minDistance &&
        Math.abs(deltaY) <= maxVerticalDrift
      ) {
        if (!visualFeedback) {
          dragging.current = false
          onBack()
          return
        }

        root.classList.add("swipe-back-settling")
        root.classList.remove("is-swiping-back")
        root.style.setProperty("--swipe-back-x", `${window.innerWidth}px`)
        root.style.setProperty("--swipe-back-opacity", "0")
        root.style.setProperty("--swipe-back-scale", "0.985")

        window.setTimeout(() => {
          onBack()
          root.style.setProperty("--swipe-back-x", "0px")
          root.style.setProperty("--swipe-back-opacity", "1")
          root.style.setProperty("--swipe-back-scale", "1")
          root.classList.remove("swipe-back-settling")
        }, 150)

        dragging.current = false
        return
      }

      dragging.current = false
      resetSwipe(true)
    }

    function handleTouchCancel() {
      tracking.current = false
      dragging.current = false
      resetSwipe(true)
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
      resetSwipe(false)
    }
  }, [
    onBack,
    enabled,
    minDistance,
    maxVerticalDrift,
    edgeWidth,
    visualFeedback
  ])
}

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
  minDistance = 70,
  maxVerticalDrift = 90
}: Options) {

  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {

    if (!enabled) return

    function handleTouchStart(event: TouchEvent) {

      const touch = event.touches[0]
      if (!touch) return

      startX.current = touch.clientX
      startY.current = touch.clientY
      startTime.current = Date.now()
    }

    function handleTouchEnd(event: TouchEvent) {

      const touch = event.changedTouches[0]
      if (!touch) return

      const deltaX = touch.clientX - startX.current
      const deltaY = touch.clientY - startY.current
      const elapsed = Date.now() - startTime.current

      const isRightSwipe = deltaX >= minDistance
      const isMostlyHorizontal = Math.abs(deltaY) <= maxVerticalDrift
      const isIntentional = elapsed <= 900

      if (isRightSwipe && isMostlyHorizontal && isIntentional) {
        onBack()
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }

  }, [
    onBack,
    enabled,
    minDistance,
    maxVerticalDrift
  ])
}

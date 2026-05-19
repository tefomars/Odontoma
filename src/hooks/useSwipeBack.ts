import { useEffect, useRef } from "react"

type UseSwipeBackOptions = {
  onBack: () => void
  enabled?: boolean
  edgeOnly?: boolean
  edgeSize?: number
  minDistance?: number
  maxVerticalDrift?: number
}

export function useSwipeBack({
  onBack,
  enabled = true,
  edgeOnly = true,
  edgeSize = 42,
  minDistance = 90,
  maxVerticalDrift = 65
}: UseSwipeBackOptions) {

  const startX = useRef(0)
  const startY = useRef(0)
  const tracking = useRef(false)

  useEffect(() => {

    if (!enabled) return

    function handleTouchStart(event: TouchEvent) {

      const touch =
        event.touches[0]

      if (!touch) return

      const fromLeftEdge =
        touch.clientX <= edgeSize

      if (edgeOnly && !fromLeftEdge) {
        tracking.current = false
        return
      }

      startX.current = touch.clientX
      startY.current = touch.clientY
      tracking.current = true
    }

    function handleTouchEnd(event: TouchEvent) {

      if (!tracking.current) return

      const touch =
        event.changedTouches[0]

      if (!touch) return

      const deltaX =
        touch.clientX - startX.current

      const deltaY =
        Math.abs(touch.clientY - startY.current)

      tracking.current = false

      const isRightSwipe =
        deltaX >= minDistance &&
        deltaY <= maxVerticalDrift

      if (isRightSwipe) {
        onBack()
      }
    }

    window.addEventListener(
      "touchstart",
      handleTouchStart,
      {
        passive: true
      }
    )

    window.addEventListener(
      "touchend",
      handleTouchEnd,
      {
        passive: true
      }
    )

    return () => {
      window.removeEventListener(
        "touchstart",
        handleTouchStart
      )

      window.removeEventListener(
        "touchend",
        handleTouchEnd
      )
    }

  }, [
    onBack,
    enabled,
    edgeOnly,
    edgeSize,
    minDistance,
    maxVerticalDrift
  ])
}

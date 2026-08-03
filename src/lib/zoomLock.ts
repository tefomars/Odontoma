let installed = false

export function installZoomLock() {
  if (installed || typeof document === "undefined") return
  installed = true

  const preventGestureZoom = (event: Event) => {
    event.preventDefault()
  }

  document.addEventListener("gesturestart", preventGestureZoom, {
    passive: false
  })
  document.addEventListener("gesturechange", preventGestureZoom, {
    passive: false
  })
}

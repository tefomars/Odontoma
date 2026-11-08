const EVENT = "odontoma-study-progress-changed"

/** Storage events only reach OTHER documents; notify this document as well. */
export function notifyStudyProgress(key: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

export function subscribeStudyProgress(keys: readonly string[], refresh: () => void) {
  const changed = (event: Event) => {
    const key = event.type === "storage" ? (event as StorageEvent).key : (event as CustomEvent<string>).detail
    if (!key || keys.includes(key)) refresh()
  }
  window.addEventListener(EVENT, changed)
  window.addEventListener("storage", changed)
  window.addEventListener("focus", refresh)
  return () => {
    window.removeEventListener(EVENT, changed)
    window.removeEventListener("storage", changed)
    window.removeEventListener("focus", refresh)
  }
}

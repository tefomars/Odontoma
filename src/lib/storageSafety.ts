let failure: string | null = null
const listeners = new Set<() => void>()

export function reportStorageFailure() {
  failure = "No se pudo guardar en este dispositivo. No cierres esta pestaña: liberá espacio o permití el almacenamiento y volvé a intentar. Tu avance actual sigue en pantalla."
  listeners.forEach(listener => listener())
}
export function storageFailure() { return failure }
export function dismissStorageFailure() { failure = null; listeners.forEach(listener => listener()) }
export function subscribeStorageFailure(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } }

/** Callers must only advance their in-memory state after this succeeds. */
export function writeBrowserStorage(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true } catch { reportStorageFailure(); return false }
}
export function removeBrowserStorage(key: string): boolean {
  try { localStorage.removeItem(key); return true } catch { reportStorageFailure(); return false }
}

/** For existing editor/import workflows that already use thrown errors to abort. */
export function requireBrowserStorage(key: string, value: string) {
  if (!writeBrowserStorage(key, value)) throw new Error("No se pudo guardar en este dispositivo. Liberá espacio y volvé a intentar antes de salir.")
}

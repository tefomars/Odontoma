import { requireBrowserStorage } from "./storageSafety"
export function saveSession(session: any) {

  requireBrowserStorage(
    "odontoma_session",
    JSON.stringify(session)
  )
}

export function loadSession() {

  const raw =
    localStorage.getItem(
      "odontoma_session"
    )

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {

  localStorage.removeItem(
    "odontoma_session"
  )
}

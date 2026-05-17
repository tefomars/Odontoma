export function saveSession(session: any) {

  localStorage.setItem(
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

  return JSON.parse(raw)
}

export function clearSession() {

  localStorage.removeItem(
    "odontoma_session"
  )
}

export type OdontomaBackup = {
  app: "Odontoma"
  version: number
  exportedAt: string
  localStorage: Record<string, string>
}

export function exportOdontomaBackup() {

  const data: Record<string, string> = {}

  for (let i = 0; i < localStorage.length; i++) {

    const key =
      localStorage.key(i)

    if (
      key &&
      key.startsWith("odontoma_")
    ) {
      data[key] =
        localStorage.getItem(key) || ""
    }
  }

  const backup: OdontomaBackup = {
    app: "Odontoma",
    version: 1,
    exportedAt: new Date().toISOString(),
    localStorage: data
  }

  const blob =
    new Blob(
      [JSON.stringify(backup, null, 2)],
      {
        type: "application/json"
      }
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement("a")

  link.href = url

  link.download =
    `odontoma-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export async function importOdontomaBackup(
  file: File
) {

  const text =
    await file.text()

  const backup =
    JSON.parse(text) as OdontomaBackup

  if (!backup || backup.app !== "Odontoma" || backup.version !== 1) {
    throw new Error("Archivo inválido")
  }

  if (
    !backup.localStorage ||
    typeof backup.localStorage !== "object" || Array.isArray(backup.localStorage)
  ) {
    throw new Error("Backup incompleto")
  }

  const incomingEntries =
    Object.entries(backup.localStorage)
      .filter(([key]) => key.startsWith("odontoma_"))

  for (const [key, value] of incomingEntries) {
    if (typeof value !== "string") {
      throw new Error("Backup inválido: contiene datos incompatibles.")
    }

    // This existing preference is intentionally stored as plain text, not JSON.
    if (key === "odontoma_flashcard_study_mode_v1") {
      if (value !== "fsrs" && value !== "free") throw new Error("Backup inválido: modo de flashcards desconocido.")
      continue
    }
    try {
      JSON.parse(value)
    } catch {
      throw new Error("Backup inválido: contiene datos dañados.")
    }
  }

  const previousEntries: Array<[string, string]> = []

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith("odontoma_")) continue

    const value = localStorage.getItem(key)
    if (value !== null) previousEntries.push([key, value])
  }

  try {
    // Write before removing obsolete keys: quota failures can roll back originals.
    for (const [key, value] of incomingEntries) {
      localStorage.setItem(key, value)
    }
    const incomingKeys = new Set(incomingEntries.map(([key]) => key))
    for (const [key] of previousEntries) if (!incomingKeys.has(key)) localStorage.removeItem(key)
  } catch {
    try {
      const previousKeys = new Set(previousEntries.map(([key]) => key))
      for (const [key] of incomingEntries) if (!previousKeys.has(key)) localStorage.removeItem(key)
      for (const [key, value] of previousEntries) if (localStorage.getItem(key) !== value) localStorage.setItem(key, value)
    } catch { throw new Error("No se pudo completar ni revertir toda la restauración. Conservá el archivo de backup y liberá espacio antes de reintentar.") }
    throw new Error("No se pudo restaurar el backup. Tus datos anteriores se conservaron.")
  }
}

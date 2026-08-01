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

  if (backup.app !== "Odontoma" || backup.version !== 1) {
    throw new Error("Archivo inválido")
  }

  if (
    !backup.localStorage ||
    typeof backup.localStorage !== "object"
  ) {
    throw new Error("Backup incompleto")
  }

  const incomingEntries =
    Object.entries(backup.localStorage)
      .filter(([key]) => key.startsWith("odontoma_"))

  for (const [, value] of incomingEntries) {
    if (typeof value !== "string") {
      throw new Error("Backup inválido: contiene datos incompatibles.")
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

  function clearOdontomaStorage() {
    const keys =
      Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index)
      ).filter((key): key is string => Boolean(key?.startsWith("odontoma_")))

    for (const key of keys) localStorage.removeItem(key)
  }

  try {
    clearOdontomaStorage()
    for (const [key, value] of incomingEntries) {
      localStorage.setItem(key, value)
    }
  } catch {
    clearOdontomaStorage()
    for (const [key, value] of previousEntries) {
      localStorage.setItem(key, value)
    }

    throw new Error("No se pudo restaurar el backup. Tus datos anteriores se conservaron.")
  }
}

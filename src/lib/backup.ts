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

  if (backup.app !== "Odontoma") {
    throw new Error("Archivo inválido")
  }

  if (
    !backup.localStorage ||
    typeof backup.localStorage !== "object"
  ) {
    throw new Error("Backup incompleto")
  }

  for (const [key, value] of Object.entries(
    backup.localStorage
  )) {

    if (key.startsWith("odontoma_")) {

      localStorage.setItem(
        key,
        String(value)
      )
    }
  }
}

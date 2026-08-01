export type SupportedDelimiter = "\t" | ","

export function detectDelimiter(text: string): SupportedDelimiter {
  const firstDataLine =
    text.split(/\r?\n/).find(line => line.trim()) || ""

  return firstDataLine.includes("\t") ? "\t" : ","
}

export function parseDelimitedRows(
  text: string,
  delimiter: SupportedDelimiter = detectDelimiter(text)
) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && character === delimiter) {
      row.push(field)
      field = ""
      continue
    }

    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") index += 1

      row.push(field)
      if (row.some(value => value.trim())) rows.push(row)
      row = []
      field = ""
      continue
    }

    field += character
  }

  if (quoted) {
    throw new Error("El archivo contiene comillas sin cerrar.")
  }

  row.push(field)
  if (row.some(value => value.trim())) rows.push(row)

  return rows
}

export function escapeDelimitedCell(
  value: string,
  delimiter: SupportedDelimiter
) {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export function serializeDelimitedRows(
  rows: string[][],
  delimiter: SupportedDelimiter
) {
  return rows
    .map(row =>
      row
        .map(value => escapeDelimitedCell(value, delimiter))
        .join(delimiter)
    )
    .join("\n")
}
